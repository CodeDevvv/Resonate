import { verifyToken } from "@clerk/backend"
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const getChartData = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) return res.json({ status: false, message: "Unauthorized" })

    try {
        const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
        const clerk_user_id = decoded.sub
        const today = new Date()
        const previous7days = new Date()
        previous7days.setDate(previous7days.getDate() - 7)
        previous7days.setHours(0, 0, 0, 0)
        today.setHours(23, 59, 59, 999)
        const { data: fetchScore, error: fetchScoresError } = await supabase
            .from("DiaryEntry")
            .select('mood_scores, created_at')
            .gte('created_at', previous7days.toISOString())
            .lte('created_at', today.toISOString())
            .eq('user_id', clerk_user_id)
        if (fetchScoresError) { return res.json({ status: false, message: "Error fetching chart Data" }) }
        return res.json({ status: true, chartData: fetchScore })
    } catch (err) {
        console.log(err)
        return res.json({ status: false, message: "Something unexpected occured!" })
    }
}

export const getHeatmapData = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    try {
        const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
        const clerk_user_id = decoded.sub

        const { data: fetchData, error: fetchError } = await supabase.rpc('get_daily_mood_averages', {
            user_id_input: clerk_user_id, days_input: 30
        })

        if (fetchError) {
            console.log(fetchError)
            return res.json({ status: false, message: "Error while fetching.." })
        }

        return res.json({ status: true, heatmapData: fetchData })
    } catch (err) {
        console.log(err)
        return res.json({ status: false, message: "Unexpcted Error!" })
    }
}

export const getTopics = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) return res.json({ status: false, message: "not authorized!" })

    try {
        const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
        const clerk_user_id = decoded.sub
        const today = new Date()
        const previous7days = new Date()
        previous7days.setDate(previous7days.getDate() - 7)
        previous7days.setHours(0, 0, 0, 0)
        today.setHours(23, 59, 59, 999)
        const { data: fetchTags, error: fetchError } = await supabase
            .from('DiaryEntry')
            .select('tags')
            .eq('user_id', clerk_user_id)
            .gte('created_at', previous7days.toISOString())
            .lte('created_at', today.toISOString())

        if (fetchError) {
            console.log(fetchError)
            return res.json({ status: false, message: "Error while fetching" })
        }

        const allTopics = fetchTags.flatMap(item => item.tags || []);
        const frequentTopics = {};

        for (const topic of allTopics) {
            frequentTopics[topic] = (frequentTopics[topic] || 0) + 1;
        }
        const topicsArray = Object.entries(frequentTopics);
        topicsArray.sort((a, b) => b[1] - a[1]);

        const top5Topics = topicsArray.slice(0, 5).map(([topic, count]) => ({ topic, count }));
        return res.json({ status: true, tags: top5Topics })

    } catch (err) {
        console.log(err)
        return res.json({ status: false, message: "Something unexpexted occurred" })
    }
}