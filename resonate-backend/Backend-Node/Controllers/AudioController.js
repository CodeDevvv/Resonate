import axios from "axios";
import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { decrypt_transcription } from "../Utils/DecryptTranscription.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getUserId = async (token) => {
  const decoded = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY
  })
  return decoded.sub
}

export const SaveAudio = async (req, res) => {
  if (!req.file) {
    return res.json({
      status: false,
      message: "Audio file is required"
    });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.json({
      status: false,
      message: "Authorization token is required"
    });
  }

  try {

    const clerk_user_id = await getUserId(token)
    const fileName = `${clerk_user_id}/${Date.now()}-audio.wav`;
    const filebuffer = req.file.buffer;

    // Step 1: Transcribe audio
    let encrypted_transcription;
    try {
      const response = await axios.post(
        "http://localhost:8000/transcribe",
        filebuffer,
        { headers: { "Content-Type": "application/octet-stream" } }
      );

      if (!response.data.status) {
        return res.json({
          status: false,
          message: response.data.message || "Transcription failed"
        });
      }

      encrypted_transcription = response.data.transcription;
    } catch (transcribeError) {
      console.error("Transcription error:", transcribeError);
      return res.json({
        status: false,
        message: "Transcription service unavailable"
      });
    }

    // Step 2: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(fileName, filebuffer);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.json({
        status: false,
        message: "Audio upload failed"
      });
    }

    // Step 3: Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("DiaryEntry")
      .insert([{
        audio_url: uploadData.path,
        user_id: clerk_user_id,
        transcript: encrypted_transcription,
        title: "Untitled"
      }])
      .select('audio_id');

    if (dbError) {
      console.error("Database error:", dbError);
      // Rollback: Delete uploaded file
      await supabase.storage.from("audio-recordings").remove([uploadData.fullPath]);
      return res.json({
        status: false,
        message: "Database operation failed"
      });
    }

    return res.json({
      status: true,
      message: "Audio saved successfully",
      audioID: dbData[0].audio_id
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.json({
      status: false,
      message: "Internal server error"
    });
  }
};

export const GetAudio = async (req, res) => {
  const { audio_id } = req.body;

  if (!audio_id) {
    return res.json({
      status: false,
      message: 'Audio ID is required'
    });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.json({
      status: false,
      message: "Authorization token is required"
    });
  }

  try {
    const clerk_user_id = await getUserId(token)

    // 1. Fetch audio entry from DB and verify ownership
    const { data: retrievedData, error: retrievedError } = await supabase
      .from('DiaryEntry')
      .select('*')
      .eq('audio_id', audio_id)
      .eq('user_id', clerk_user_id);

    if (retrievedError) {
      console.error("Database error:", retrievedError);
      return res.json({
        status: false,
        message: 'Database error occurred'
      });
    }

    if (!retrievedData || retrievedData.length === 0) {
      return res.json({
        status: false,
        message: 'Audio not found or access denied'
      });
    }

    const audioPath = retrievedData[0].audio_url;
    if (!audioPath) {
      return res.json({
        status: false,
        message: 'Audio path not found'
      });
    }

    // 2. Download file from Supabase Storage
    const { data: audioFile, error: audioFileError } = await supabase.storage
      .from("audio-recordings")
      .download(audioPath);

    if (audioFileError || !audioFile) {
      console.error("Storage error:", audioFileError);
      return res.json({
        status: false,
        message: 'Audio file not found in storage'
      });
    }

    // 3. Convert Blob to Buffer and stream to client
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'inline; filename="audio.wav"');
    res.setHeader('Content-Length', buffer.length);

    // Send the buffer directly
    res.end(buffer);

  } catch (error) {
    console.error("Server error:", error);
    return res.json({
      status: false,
      message: "Internal server error"
    });
  }
};

export const FetchDetails = async (req, res) => {
  const audio_id = req.query.audioID
  if (!audio_id) { return res.json({ status: false, message: "Audio Not Found!" }) }

  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) { return res.json({ status: false, message: "Unauthorized!" }) }

  try {
    const clerk_user_id = await getUserId(token)
    const { data: fetchedData, error: fetchError } = await supabase
      .from('DiaryEntry')
      .select('title, transcript')
      .eq('audio_id', audio_id)
      .eq('user_id', clerk_user_id)

    if (fetchError) {
      return res.json({ status: false, message: "Fetch Error!" })
    }
    return res.json({ status: true, record: { title: fetchedData[0].title, transcript: decrypt_transcription(fetchedData[0].transcript) } })
  } catch (error) {
    console.log(error)
  }
}

export const getAnalysis = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', "");
  if (!token) {
    return res.json({ status: false, message: "Unauthorized!" });
  }

  const audio_id = req.query.audioId

  try {
    const clerk_user_id = await getUserId(token);

    const { data: fetchAnalysis, error: fetchAnalysisError } = await supabase
      .from('DiaryEntry')
      .select('ai_summary, mood, reflections, suggestions,tags,goals')
      .eq('audio_id', audio_id)
      .eq('user_id', clerk_user_id)
      .single();

    if (fetchAnalysisError && fetchAnalysisError.code !== 'PGRST116') {
      console.log(fetchAnalysisError)
      return res.json({ status: false, message: "Database fetch error!" });
    }

    if (fetchAnalysis && fetchAnalysis.ai_summary) {
      return res.json({ status: true, analysis: fetchAnalysis });
    }

    const { transcript } = req.body;
    console.log("Running Analysis...")
    const response = await axios.post("http://localhost:8000/analysis_transcript",
      { transcript: transcript },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { results, status, message } = response.data;
    if (!status) {
      return res.json({ status: false, message: message });
    }
    console.log(results)
    const CUTOFF = 0.5
    const significantMood = Object.entries(results.mood)
      .filter(([mood, score]) => typeof score === 'number' && score >= CUTOFF)
      .map(([mood, score]) => mood)

    const { error: updateDataError } = await supabase
      .from('DiaryEntry')
      .update({
        ai_summary: results.ai_summary,
        mood: significantMood,
        reflections: results.reflections,
        suggestions: results.suggestions,
        mood_scores: results.mood,
        goals: results.goal,
        tags: results.tags
      })
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audio_id);

    if (updateDataError) {
      console.error("Supabase update error:", updateDataError);
      return res.json({ status: false, message: 'Failed to save analysis!' });
    }
    results.mood = significantMood
    return res.json({ status: true, analysis: results });

  } catch (error) {
    console.error("General error in getAnalysis:", error);
    return res.json({ status: false, message: "An unexpected server error occurred." });
  } finally {
    console.log("Analyse Finished")

  }
};

export const SetTitle = async (req, res) => {
  const audio_id = req.query.audioid
  const newTitle = req.body.newtitle

  if (!audio_id || !newTitle) { return res.json({ status: false, message: "Resource Error!" }) }

  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) return res.json({ status: false, message: "unAuthorized!" })

  try {
    const clerk_user_id = await getUserId(token)
    const { error: updateError } = await supabase
      .from("DiaryEntry")
      .update({ title: newTitle })
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audio_id)

    if (updateError) { return res.json({ status: false, message: "Title Update Failed!" }) }

    return res.json({ status: true, message: "Title Updated!" })
  } catch (error) {
    console.log(error)
  }

}

