import axios from "axios";
import { getUserId, supabase } from "../utils/config.js";
import { decrypt } from "../utils/encryption.js";

export const createEntry = async (req, res) => {
  try {
    if (!req.file) return res.json({ status: false, message: "Audio file is required" });
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.json({ status: false, message: "Authorization token is required" });

    const userId = await getUserId(token)
    const fileName = `${userId}/${Date.now()}-audio.wav`;
    const filebuffer = req.file.buffer;

    console.log("Saving Audio to Supabase Storage...")
    // Uplaod audio to supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(fileName, filebuffer);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ status: false, message: "Storage Error!" })
    }

    // Insert row to "DiaryEntry" table
    const { data: dbData, error: dbError } = await supabase
      .from("DiaryEntry")
      .insert({
        audio_path: uploadData.path,
        user_id: userId,
        title: "Untitled",
        status: 'processing'
      })
      .select('entryId:entry_id')
      .single()

    if (dbError) {
      console.error("Database error");
      // Rollback: Delete uploaded file
      await supabase.storage.from("audio-recordings").remove([uploadData.fullPath]);
      return res.status(500).json({ status: false, message: "Database Error!" })
    }

    console.log("Audio Saved and Audio entry is made into 'DiaryEntry' table.")
    const entryId = dbData.entryId
    // Trigger fastAPI (Fire and Forget)
    dispatchAnalysis(entryId, userId)
    return res.status(200).json({ status: true, message: "Save Sucess, analyzing", "entryId": entryId })
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getEntriesList = async (req, res) => {
  try {
    console.log("Fetching Diary Entires.")
    const token = req.headers.authorization?.replace('Bearer ', "")
    if (!token) {
      console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
      return res.status(401).json({ status: false, message: "Unauthorized" })
    }

    const userId = await getUserId(token)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pagesize) || 5;
    console.log("page: " + page + " pageSize: " + pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize

    let { data: fetchedData, error: fetchError } = await supabase
      .from('DiaryEntry')
      .select('entryId:entry_id, title, createdAt:created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) {
      console.log(`Error while fetching data from DB : ${fetchError}`)
      return res.status(500).json({ status: false, message: "Database Fetch Error!" })
    }

    const hasNext = fetchedData.length > pageSize
    fetchedData = hasNext ? fetchedData.slice(0, pageSize) : fetchedData
    console.log(`fetching Diary Entries from ${from} - to : ${to}`)
    console.log("hasNext? " + hasNext)
    return res.json({
      status: true,
      entries: fetchedData,
      hasNext: hasNext
    })

  } catch (error) {
    console.log(`Error while fetching data: ${error}`)
    return res.status(500).json({ status: false, message: "Server Error!" })
  }
}

export const dispatchAnalysis = async (entryId, userId) => {
  try {
    console.log("Start dispatchAnalysis for entryId: " + entryId)

    const { data: entryDetails, error } = await supabase
      .from("DiaryEntry")
      .select("transcript, audio_path, ai_summary, tags, mood_labels, reflections, suggestions, mood_scores, goals, status, isGoalAdded")
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .maybeSingle()

    if (error) {
      console.log("Error Occured When fetching transcription from DB: ");
      throw error
    }

    if (entryDetails.status === 'completed' || entryDetails.status === 'failed') {
      await supabase
        .from("DiaryEntry")
        .update({ status: "processing" })
        .eq('user_id', userId)
        .eq('entry_id', entryId)
    }

    const { transcript, audio_path, ai_summary, tags, mood_scores, reflections, suggestions, goals, isGoalAdded } = entryDetails || {};
    const hasTranscript = !!transcript
    let signedAudioUrl = "";
    if (!hasTranscript && audio_path) {
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('audio-recordings')
        .createSignedUrl(audio_path, 3600);
      if (signedUrlError) {
        throw new Error("Error generating signed URL: " + signedUrlError.message);
      }
      signedAudioUrl = signedUrlData?.signedUrl
    }

    const fastApiPayLoad = {
      hasTranscript: hasTranscript,
      hasSummary: !!ai_summary,
      hasTags: !!tags && tags.length > 0,
      hasMoodScores: mood_scores ? Object.keys(mood_scores).length > 0 : false,
      hasReflections: !!reflections,
      hasSuggestions: !!suggestions,
      hasGoals: !!goals && goals.toLowerCase().trim() !== 'none detected',
      audioUrl: signedAudioUrl,
      transcript: transcript || "",
      userId: userId,
      entryId: entryId,
      isGoalAdded: isGoalAdded
    };
    console.log("Triggering FastApi for Analysis (Fire and Forget)");
    // Call to FastApi to Analyze 
    await axios.post("http://localhost:8000/analyze", fastApiPayLoad)
    console.log("FastApi task dispatched successfully");
    return true
  } catch (error) {
    console.error("Analysis Dispatch Failed:", error.message);
    return false
  }
}

export const reanalyzeEntry = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.json({ status: false, message: "Authorization token is required" });

    const userId = await getUserId(token)
    const entryId = req.query.entryId

    dispatchAnalysis(entryId, userId)
    req.io.to(entryId).emit('entry_update', {
      status: 'processing'
    })
    return res.status(200).json({ status: true, message: "Refetch Analysis started" })
  } catch (error) {
    console.log("Error while refetch: ", error)
    req.io.to(entryId).emit('entry_update', {
      status: 'failed'
    })
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

export const getEntryById = async (req, res) => {
  const entryId = req.query.entryId
  console.log(`Fetch Entry Details for entryId: ${entryId}`)
  if (!entryId) {
    console.log("[Warn] Audio ID not received. Abort")
    return res.json({ status: false, message: "Audio Not Found!" })
  }

  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.json({ status: false, message: "Unauthorized" })
  }

  try {
    const userId = await getUserId(token)
    const { data: entryDetails, error: entryError } = await supabase
      .from('DiaryEntry')
      .select('title, audio_path, transcript, ai_summary ,tags, mood_labels, reflections, suggestions, mood_scores, goals, status, isGoalAdded')
      .eq('entry_id', entryId)
      .eq('user_id', userId)
      .maybeSingle()

    if (entryError) {
      console.log(`Error while Entry call to DB : ${entryError}`)
      return res.json({ status: false, message: "Fetch Error!" })
    }

    try {
      entryDetails.transcript = decrypt(entryDetails.transcript);
      entryDetails.ai_summary = decrypt(entryDetails.ai_summary);
      entryDetails.reflections = decrypt(entryDetails.reflections);
      entryDetails.suggestions = decrypt(entryDetails.suggestions);
      entryDetails.goals = decrypt(entryDetails.goals);
    } catch (decryptError) {
      console.error("Decryption failed:", decryptError);
      return res.json({ status: false, message: "Decryption Error!" });
    }

    if (entryDetails.audio_path) {
      const { data: signedUrlData, error } = await supabase
        .storage
        .from('audio-recordings')
        .createSignedUrl(entryDetails.audio_path, 3600);

      if (error) {
        throw new Error("Error generating signed URL:", error.message);
      }

      entryDetails.audioUrl = signedUrlData.signedUrl;
      delete entryDetails.audio_path;
    }

    console.log("Entry Fetched successfully");
    // const entryDetailsTemplate = {
    //   title: "",
    //   transcript: "",
    //   ai_summary: "",
    //   tags: [],
    //   mood_labels: [],
    //   reflections: "",
    //   suggestions: "",
    //   mood_scores: { 
    //     joy: 0, 
    //     calm: 0, 
    //     fear: 0, 
    //     love: 0, 
    //     anger: 0, 
    //     sadness: 0, 
    //     surprise: 0 
    //   },
    //   goals: "",
    //   status: "", 
    //   audioUrl: "",
    // isGoalAdded: ""
    // };
    return res.json({ status: true, entryDetails })
  } catch (error) {
    console.log(`Error while fetching Data : ${error}`)
    return res.json({ status: false, message: "Server Error!" })
  }
}

export const updateTitle = async (req, res) => {
  try {
    const entryId = req.query.entryId
    const newTitle = req.body.newTitle

    console.log(`[INFO] Initiating title update for Diary Entry. New Title: "${newTitle}"`)
    if (!entryId || !newTitle) {
      console.log(`[WARN] Validation failed: Missing entryId (${entryId}) or newTitle (${newTitle}). Aborting update.`)
      return res.status(400).json({ message: "Missing data" })
    }

    const token = req.headers.authorization?.replace('Bearer ', "")
    if (!token) {
      console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userId = await getUserId(token)
    const { error: updateError } = await supabase
      .from("DiaryEntry")
      .update({ title: newTitle })
      .eq('user_id', userId)
      .eq('entry_id', entryId)

    if (updateError) {
      console.log(`[ERROR] Database Update Error: Failed to update title in Supabase. Details: ${JSON.stringify(updateError)}`)
      return res.status(500).json({ message: "Update failed" })
    }

    console.log(`[INFO] Successfully updated title for Audio ID: ${entryId}.`)
    return res.status(200).json({ message: "Title updated" })
  } catch (error) {
    console.log(`[ERROR] Internal Server Error: Unexpected exception in updateTitle controller. Stack: ${error.stack || error}`)
    return res.status(500).json({ message: "Server error" })
  }
}

export const deleteEntry = async (req, res) => {
  console.log(`Deleting Entry...`);
  const token = req.headers.authorization?.replace('Bearer ', "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const entryId = req.query.entryId;
  const userId = await getUserId(token)
  console.log("entry", entryId)
  console.log("user", userId)
  try {
    // Delete the DB Entry
    // The SQL Trigger will automatically find and delete the file in 'audio-recordings'
    const { error, count } = await supabase
      .from("DiaryEntry")
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('entry_id', entryId);

    if (error) {
      console.error("DB Delete Error:", error.message);
      return res.status(500).json({ message: "Failed to delete entry" });
    }

    if (count === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.status(200).json({ message: "Entry and Audio deleted successfully" });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

