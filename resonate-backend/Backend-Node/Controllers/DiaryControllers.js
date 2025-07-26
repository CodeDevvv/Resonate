import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const FetchDetails = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', "")
  if (!token) {
    return res.json({
      status: false,
      message: "Unauthorized!"
    })
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
    const to = from + pageSize - 1
    const { data: fetchedData, count: fetchTotalRecords, error: fetchError } = await supabase
      .from('DiaryEntry')
      .select('audio_id, title, created_at', { count: 'exact' })
      .eq('user_id', clerk_user_id)
      .range(from, to)

    if (fetchError) {
      return res.json({
        status: false,
        message: "Database Fetch Error!"
      })
    } else {
      return res.json({
        status: true,
        details: fetchedData,
        total: fetchTotalRecords
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export const DeleteEntry = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', "");
  if (!token) return res.json({ status: false, message: "Unauthorized!" });

  const audioid = req.query.id;
  if (!audioid) return res.json({ status: false, message: "Something Went Wrong!" });

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    const clerk_user_id = decoded.sub;

    const { data: record, error: recordError } = await supabase
      .from("DiaryEntry")
      .select('audio_url')
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audioid)
      .single();

    if (recordError || !record) {
      return res.json({ status: false, message: "Record Couldn't be fetched!" });
    }

    const { error: storageError } = await supabase.storage
      .from("audio-recordings")
      .remove([record.audio_url]);

    if (storageError) {
      return res.json({ status: false, message: "Couldn't Delete Audio!" });
    }

    const { error: dbError } = await supabase
      .from("DiaryEntry")
      .delete()
      .eq('user_id', clerk_user_id)
      .eq('audio_id', audioid);

    if (dbError) {
      return res.json({ status: false, message: "Deletion Failed!" });
    }

    return res.json({ status: true, message: "Deleted Successfully!" });

  } catch (error) {
    console.error(error);
    return res.json({ status: false, message: "Internal Server Error!" });
  }
};

export const getTFTD = async (req, res) => {
  fetch("https://zenquotes.io/api/today")
    .then(res => res.json())
    .then(data => {
      return res.json({ content: data[0].q, author: data[0].a });
    })
    .catch((err) => {
      console.log(err)
      return res.json({ content: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" });
    });
}

