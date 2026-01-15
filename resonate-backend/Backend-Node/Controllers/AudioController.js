import axios from "axios";
import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { decrypt_transcription } from "../Utils/DecryptTranscription.js";
import { title } from "process";

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
  if (!req.file) return res.json({ status: false, message: "Audio file is required" });

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.json({ status: false, message: "Authorization token is required" });

  try {
    const clerk_user_id = await getUserId(token)
    const fileName = `${clerk_user_id}/${Date.now()}-audio.wav`;
    const filebuffer = req.file.buffer;

    console.log("Saving Audio to Supabase Storage...")
    // Uplaod audio to supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(fileName, filebuffer);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.json({ status: false, message: "Audio upload failed" });
    }

    // Insert row to "DiaryEntry" table
    const { data: dbData, error: dbError } = await supabase
      .from("DiaryEntry")
      .insert({
        audio_url: uploadData.path,
        user_id: clerk_user_id,
        title: "Untitled"
      })
      .select('audio_id')
      .single()

    if (dbError) {
      console.error("Database error:", dbError);
      // Rollback: Delete uploaded file
      await supabase.storage.from("audio-recordings").remove([uploadData.fullPath]);

      return res.json({ status: false, message: "Database operation failed" });
    }
    console.log("Audio Saved and Audio entry is made into table.")

    const { data: signedData, error } = await supabase
      .storage
      .from('audio-recordings')
      .createSignedUrl(uploadData.path, 3600);

    if (error) {
      console.log("Signed URL error: ", error)
      throw error
    }
    const audio_id = dbData.audio_id
    res.json({ status: true, message: "Save Sucess, analyzing", "audioID": audio_id })

    // Trigger fastAPI
    getTranscriptionForAudio(signedData.signedUrl, audio_id, clerk_user_id)
  } catch (error) {
    console.error("Server error:", error);
    return res.json({ status: false, message: "Internal server error" });
  }
};

// Helper for triggering AI analysis
export const getTranscriptionForAudio = async (url, entryId, clerk_user_id) => {
  try {
    const { data: transcriptionData } = await supabase
      .from("DiaryEntry")
      .select("transcript")
      .eq('user_id', clerk_user_id)
      .eq('audio_id', entryId)
      .maybeSingle()

    let transcription = transcriptionData?.transcript;

    if (!transcription || transcription.length <= 0 || transcription == null) {
      console.log("Requested FastApi Backend for transcription")
      const response = await axios.post("http://localhost:8000/transcribe", { url });
      transcription = response.data.transcription
      if (!transcription) throw new Error("Transcription was returned 'null'")
      // Add transcription to table
      await supabase
        .from('DiaryEntry')
        .update({
          transcript: transcription,
          status: 'processing'
        })
        .eq('user_id', clerk_user_id)
        .eq('audio_id', entryId)
      console.log("Transcription Generated Successfully.")
    }
    return triggerAnalysis(transcription, clerk_user_id, entryId)
  } catch (error) {
    console.log("Error Message: " + error.message + " Error Object: " + error)
    await supabase
      .from('entries')
      .update({
        status: 'failed',
      })
      .eq('user_id', clerk_user_id)
      .eq('audio_id', entryId)
  }
}

// TODO this : Retry ony in FastAPi , if failed then update subasbase, right now if even one fails we are putting failed , next time take whatver is done , then will re run for others
const triggerAnalysis = async (transcription, clerk_user_id, entryId) => {
  try {

    if (!transcription) return
    console.log("Triggered AI Analysis...")

    const { data: aiData, error } = await supabase
      .from("DiaryEntry")
      .select(`ai_summary, tags, mood, reflections, suggestions, mood_scores, goals`)
      .eq('user_id', clerk_user_id)
      .eq('audio_id', entryId)
      .maybeSingle();

    const { ai_summary, tags, mood, reflections, suggestions, goals } = aiData || {};

    const status = {
      hasSummary: !!ai_summary,
      hasTags: !!tags && tags.length > 0,
      hasMood: !!mood && mood.length > 0,
      hasReflections: !!reflections,
      hasSuggestions: !!suggestions,
      hasGoals: !!goals && goals.length > 0
    };

    const response = await axios.post("http://localhost:8000/analyisTranscript", { transcription: transcription, status: status });

    const { ai_results } = response.data
    if (!ai_results || Object.keys(ai_results).length === 0) {
      throw new error("AI Analysis failed..")
    }

    const prepareInsertData = {};
    let completed = true; // Tracks if the record is fully processed

    // 1. Summary 
    if (!status.hasSummary) {
      if (ai_results.ai_summary) {
        prepareInsertData["ai_summary"] = ai_results.ai_summary;
      } else {
        completed = false;
      }
    }

    // 2. Tags
    if (!status.hasTags) {
      if (ai_results.tags) {
        prepareInsertData["tags"] = ai_results.tags;
      } else {
        completed = false;
      }
    }

    // 3. Mood
    if (!status.hasMood) {
      if (ai_results.mood) {
        prepareInsertData["mood_scores"] = ai_results.mood;
        const CUTOFF = 0.5;
        const significantMood = Object.entries(ai_results.mood)
          .filter(([_, score]) => typeof score === 'number' && score >= CUTOFF)
          .map(([mood]) => mood);

        prepareInsertData["mood"] = significantMood;
      } else {
        completed = false;
      }
    }

    // 4. Reflections
    if (!status.hasReflections) {
      if (ai_results.reflections) {
        prepareInsertData["reflections"] = ai_results.reflections;
      } else {
        completed = false;
      }
    }

    // 5. Suggestions
    if (!status.hasSuggestions) {
      if (ai_results.suggestions) {
        prepareInsertData["suggestions"] = ai_results.suggestions;
      } else {
        completed = false;
      }
    }

    // 6. Goals
    if (!status.hasGoals) {
      if (ai_results.goals) {
        prepareInsertData["goals"] = ai_results.goals;
      } else {
        completed = false;
      }
    }

    prepareInsertData["status"] = completed ? 'completed' : 'failed'

    const { error: updateDataError } = await supabase
      .from('DiaryEntry')
      .update(prepareInsertData)
      .eq('user_id', clerk_user_id)
      .eq('audio_id', entryId);


    if (updateDataError) {
      throw new Error(updateDataError)
    }
    console.log("AI Analysis Successfull.. Table Updated.")
    return true
  } catch (err) {
    if (err.response) {
      // CASE A: The Server Responded with a Status Code (4xx, 5xx)
      console.error("FastAPI Error Status:", err.response.status);
      console.error("FastAPI Error Body:", err.response.data);
    } else if (err.request) {
      // CASE B: The Server didn't respond at all 
      console.error("No response received from Python server");
    } else {
      // CASE C: Request setup failed
      console.error("Request Error:", err.message);
    }

    await supabase
      .from('DiaryEntry')
      .update({
        status: 'failed',
      })
      .eq('user_id', clerk_user_id)
      .eq('audio_id', entryId)
    return false
  }
}

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

export const FetchEntryDetails = async (req, res) => {
  const audio_id = req.query.audioID
  console.log(`Fetch Entry Details for audioId: ${audio_id}`)
  if (!audio_id) {
    console.log("[Warn] Audio ID not received. Abort")
    return res.json({ status: false, message: "Audio Not Found!" })
  }

  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.json({ status: false, message: "Unauthorized" })
  }

  try {
    const clerk_user_id = await getUserId(token)
    const { data: entryDetails, error: entryError } = await supabase
      .from('DiaryEntry')
      .select('title, transcript', 'ai_summary')
      .eq('audio_id', audio_id)
      .eq('user_id', clerk_user_id)
      .single()

    if (entryError) {
      console.log(`Error while Entry call to DB : ${entryError}`)
      return res.json({ status: false, message: "Fetch Error!" })
    }
    console.log("Entry Fetched successfully")
    entryDetails["transcript"] = decrypt_transcription(entryDetails["transcript"])
    return res.json({ status: true, entryDetails })
  } catch (error) {
    console.log(`Error while fetching Data : ${error}`)
    return res.json({ status: false, message: "Server Error!" })
  }
}

export const getAnalysis = async (results, transcription, clerk_user_id, audio_id) => {


  return res.json({ status: true, analysis: results });

};

export const SetTitle = async (req, res) => {
  const audio_id = req.query.audioid
  const newTitle = req.body.newtitle

  console.log(`[INFO] Initiating title update for Diary Entry. New Title: "${newTitle}"`)
  if (!audio_id || !newTitle) {
    console.log(`[WARN] Validation failed: Missing audio_id (${audio_id}) or newTitle (${newTitle}). Aborting update.`)
    return res.status(400).json({ message: "Missing data" })
  }

  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const clerk_user_id = await getUserId(token)
    const { error: updateError } = await supabase
      .from("DiaryEntry")
      .update({ title: newTitle })
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audio_id)

    if (updateError) {
      console.log(`[ERROR] Database Update Error: Failed to update title in Supabase. Details: ${JSON.stringify(updateError)}`)
      return res.status(500).json({ message: "Update failed" })
    }

    console.log(`[INFO] Successfully updated title for Audio ID: ${audio_id}.`)
    return res.status(200).json({ message: "Title updated" })
  } catch (error) {
    console.log(`[ERROR] Internal Server Error: Unexpected exception in updateTitle controller. Stack: ${error.stack || error}`)
    return res.status(500).json({ message: "Server error" })
  }
}
