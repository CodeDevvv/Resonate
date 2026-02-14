import { getUserId, supabase } from "../utils/config";

export const getInsights = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.log("[Insights] Authorization token missing");
            return res.status(401).json({ status: false, message: "Authentication required" });
        }

        const userId = await getUserId(token);
        console.log(`[Insights] Fetching data for User: ${userId}`);

        const { data, error } = await supabase
            .rpc('get_insights', {
                arg_user_id: userId,
                days_to_avg: 30,
                loopback_day: 7
            });

        if (error) {
            console.error("[Insights] Database Error:", error.message);
            return res.status(404).json({ status: false, error: error.message });
        }

        console.log("[Insights] Successfully retrieved analytics data");
        console.log("data: ", data)
        return res.status(200).json({ status: true, insights: data });

    } catch (error) {
        console.error("[Insights] Critical Server Error:", error.message);
        return res.status(500).json({ status: false });
    }
}
