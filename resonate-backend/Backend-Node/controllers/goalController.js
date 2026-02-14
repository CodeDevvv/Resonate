import { getUserId, supabase } from "../utils/config";

export const addGoal = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            console.log("[Goal] Authorization token missing");
            return res.status(401).json({ status: false, message: "Authentication required" });
        }

        const userId = await getUserId(token);
        const goalData = req.body;

        if (!goalData || !goalData.title) {
            console.log("[Goal] Request body is empty or missing title");
            return res.status(400).json({ status: false, message: "Goal details are required" });
        }

        const { title, description, targetDate, entryId } = goalData;

        const currDate = new Date();
        currDate.setHours(0, 0, 0, 0);
        const getTarget = new Date(targetDate);

        if (getTarget < currDate) {
            console.log(`[Goal] Validation failed: Date ${targetDate} is in the past`);
            return res.status(400).json({ status: false, message: "The target date cannot be in the past" });
        }

        const { error: insertError } = await supabase
            .from('GoalEntry')
            .insert([{
                title: title,
                description: description,
                target_date: targetDate,
                user_id: userId,
                entry_id: entryId
            }], { count: 'minimal' });

        if (insertError) {
            console.log("[Goal] Database insert error:", insertError.message);
            return res.status(500).json({ status: false, message: "Could not save your goal at this time" });
        }

        console.log(`[Goal] successfully created: ${title}`);
        return res.status(201).json({ status: true, message: "Goal has been added successfully!" });

    } catch (error) {
        console.log("[Goal] Unexpected system error:", error);
        return res.status(500).json({ status: false, message: "An unexpected error occurred" });
    }
}

export const getGoals = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).json({ status: false, message: "Authentication required" })
        }

        const userId = await getUserId(token)
        if (!userId) {
            return res.status(401).json({ status: false, message: "Session expired, please login again" })
        }
        const { data, error } = await supabase
            .from('GoalEntry')
            .select(`               
                goalId: goal_id,
                createdAt: created_at,
                title,
                description,
                isCompleted,
                targetDate: target_date,
                entryId: entry_id,
                userId: user_id
            `)
            .eq('user_id', userId)
            .order('target_date', { ascending: true });
        if (error) {
            console.log(error)
            return res.status(500).json({ status: false, message: "Unable to retrieve goals" })
        }

        return res.status(200).json({ status: true, message: "Goals fetched successfully", goalEntries: data })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal server error" })
    }
}

export const updateGoal = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) return res.json({ status: false, message: "unauthorized call" })

    try {

        const userId = await getUserId(token);
        if (!userId) return res.json({ status: false, message: "session expired! login back" })

        const updateData = req.body
        const currDate = new Date()
        currDate.setHours(0, 0, 0, 0)
        const getTarget = new Date(updateData.targetDate)

        if (!updateData.isCompleted && getTarget < currDate) { return res.json({ status: false, message: "target date cannot be in past!" }) }

        const { error: updateError } = await supabase
            .from('GoalEntry')
            .update({
                'title': updateData.title,
                'description': updateData.description,
                'target_date': updateData.targetDate,
                'isCompleted': updateData.isCompleted
            })
            .eq('goal_id', updateData.goalId)
            .eq('user_id', userId)

        if (updateError) {
            console.log(updateError)
            return res.json({ status: false, message: "error while updating goal" })
        }

        return res.json({ status: true })

    } catch (error) {
        console.log(error)
    }
}

export const deleteGoal = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', "");
        if (!token) {
            console.log("[Goal] Authorization token missing");
            return res.status(401).json({ status: false, message: "Unauthorized Call" });
        }

        const userId = await getUserId(token);
        if (!userId) {
            console.log("[Goal] Session expired");
            return res.status(401).json({ status: false, message: "Session expired, please login again" });
        }

        const { goalId } = req.query;

        if (!goalId) {
            console.log("[Goal] Delete request missing goalId");
            return res.status(400).json({ status: false, message: "Goal ID is required" });
        }

        const { error: deleteError } = await supabase
            .from('GoalEntry')
            .delete()
            .eq('goal_id', goalId)
            .eq('user_id', userId);

        if (deleteError) {
            console.log("[Goal] Database delete error:", deleteError.message);
            return res.status(500).json({ status: false, message: "Error while deleting goal" });
        }

        console.log(`[Goal] Successfully deleted goal ID: ${goalId}`);
        return res.status(200).json({ status: true, message: "Goal deleted successfully" });

    } catch (error) {
        console.log("[Goal] Unexpected system error:", error);
        return res.status(500).json({ status: false, message: "Unexpected error occurred" });
    }
}