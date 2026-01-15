import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import path from 'path'
import fs from 'fs/promises'
import { getTranscriptionForAudio } from "./AudioController";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const FetchDairyEntries = async (req, res) => {
  console.log("Fetching Diary Entires.")
  const token = req.headers.authorization?.replace('Bearer ', "")

  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.json({ status: false, message: "Unauthorized" })
  }

  try {
    // Verify token
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    })
    const clerk_user_id = decoded.sub
    const page = req.query.page
    const pageSize = req.query.pagesize
    const from = (page - 1) * 5
    const to = from + pageSize
    console.log(`fetching Diary Entries from ${from} - to : ${to - 1}`)

    let { data: fetchedData, error: fetchError } = await supabase
      .from('DiaryEntry')
      .select('audio_id, title, created_at')
      .eq('user_id', clerk_user_id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) {
      console.log(`Error while fetching data from DB : ${fetchError}`)
      return res.json({ status: false, message: "Database Fetch Error!" })
    }

    const hasNext = fetchedData.length > pageSize
    fetchedData = hasNext ? fetchedData.slice(from, to - 1) : fetchedData

    return res.json({
      status: true,
      entries: fetchedData,
      hasNext: hasNext
    })

  } catch (error) {
    console.log(`Error while fetching data: ${error}`)
    return res.json({ status: false, message: "Server Error!" })
  }
}

export const DeleteEntry = async (req, res) => {
  console.log(`Deleteing Entry`)
  const token = req.headers.authorization?.replace('Bearer ', "");
  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.status(401).json({ message: "Unauthorized" })
  };

  const audioid = req.query.id;
  if (!audioid) {
    console.log("Deleting Entry Id not received")
    return res.status(400).json({ message: "Audio Id not received" })
  };

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    const clerk_user_id = decoded.sub;

    // Get audio path for supabase storage
    const { data: record, error: fetchError } = await supabase
      .from("DiaryEntry")
      .select('audio_url')
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audioid)
      .single();

    if (fetchError || !record) {
      console.error(`[WARN] Fetch failed for audio ${audioid}:`, fetchError?.message);
      return res.status(404).json({ message: "Record not found" });
    }

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from("audio-recordings")
      .remove([record.audio_url]);

    if (storageError) {
      console.error(`[ERROR] Storage deletion failed:`, storageError.message);
      return res.status(500).json({ message: "File deletion failed" });
    }

    // Delete row 
    const { error: dbError } = await supabase
      .from("DiaryEntry")
      .delete()
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audioid);

    if (dbError) {
      console.error(`[ERROR] DB row deletion failed:`, dbError.message);
      return res.status(500).json({ message: "Database sync failed" });
    }

    return res.status(200).json({ message: "Deleted Successfully!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getTFTD = async (req, res) => {
  try {
    console.log("Fetching Thought of the day.")
    const filePath = path.join(__dirname, '..', 'Utils', 'daily_thoughts.json');
    const fileData = await fs.readFile(filePath, 'utf8')

    const thoughts = JSON.parse(fileData)

    const todayIndex = Math.floor(new Date() / (1000 * 60 * 60 * 24));

    const thought_index = todayIndex % thoughts.length;
    const thought = thoughts[thought_index]
    console.log("Fetched thought index : " + thought_index)
    return res.json(thought)

  } catch (error) {
    console.error("Error reading thoughts file:", error);
    res.status(500).json({ error: "Could not load thoughts" });
  }
}

export const refetchAnalysis = async (req, res) => {
  console.log("Re Running Analysis to capture missing data")
  const token = req.headers.authorization?.replace('Bearer ', "")

  if (!token) {
    console.log(`[WARN] Unauthorized: Missing Authorization token in request headers.`)
    return res.json({ status: false, message: "Unauthorized" })
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    const clerk_user_id = decoded.sub;
    const audio_id = req.query.audioId
    const { data: signedData, error } = await supabase
      .storage
      .from('audio-recordings')
      .createSignedUrl(uploadData.path, 3600);

    if (error) {
      console.log("Signed URL error: ", error)
      return res.json({ status: false, message: "Error getting audio error" })
    }
    const status = await getTranscriptionForAudio(signedData.signedUrl, audio_id, clerk_user_id)
    if (status) {
      return res.json({ status: true })
    }
    return res.json({ status: false, message: "Failed to refetch" })
  } catch (error) {
    console.log("Internal server error: ", error)
    return res.json({ status: false, message: "Server Error" })
  }

}