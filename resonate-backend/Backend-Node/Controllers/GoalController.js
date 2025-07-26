import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const AddGoal = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) { return res.json({ status: false, message: "unauthorized request" }) }
    try {
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        })
        const clerk_user_id = decoded.sub
        const goalData = req.body
        if (!goalData) { return res.json({ status: false, message: "Goal not found!" }) }
        const currDate = new Date()
        currDate.setHours(0, 0, 0, 0)
        const getTarget = new Date(goalData.target_date)

        if (getTarget < currDate) { return res.json({ status: false, message: "target date cannot be in past!" }) }

        const { error: insertError } = await supabase
            .from('GoalEntries')
            .insert([{
                name: goalData.title,
                description: goalData.desc,
                target_date: goalData.target_date,
                user_id: clerk_user_id
            }])
            .eq('user_id', clerk_user_id)

        if (insertError) {
            console.log(insertError)
            return res.json({ status: false, message: "Error occurred while adding goal" })
        }

        return res.json({ status: true, message: "Goal added!" })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Unexpected error" })
    }
}

export const GetGoals = async (req, res) => {
    const token = req.headers.authorization.replace("Bearer ", "")
    if (!token) return res.json({ status: false, message: "unauthorized call" })

    try {
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        })
        const clerk_user_id = decoded.sub

        if (!clerk_user_id) return res.json({ status: false, message: "session expired, login again!" })

        const { data: fetchGoals, error: fetchError } = await supabase
            .from('GoalEntries')
            .select('*')
            .eq('user_id', clerk_user_id)

        if (fetchError) {
            console.log(fetchError)
            return res.json({ status: false, message: "error while fetching goals" })
        }

        return res.json({ status: true, goals: fetchGoals })


    } catch (error) {
        console.log(error)
    }
}

export const UpdateGoal = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) return res.json({ status: false, message: "unauthorized call" })

    try {
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        })
        const clerk_user_id = decoded.sub
        if (!clerk_user_id) return res.json({ status: false, message: "session expired! login back" })

        const updateData = req.body
        const currDate = new Date()
        currDate.setHours(0, 0, 0, 0)
        const getTarget = new Date(updateData.target_date)

        if (getTarget < currDate) { return res.json({ status: false, message: "target date cannot be in past!" }) }

        const { error: updateError } = await supabase
            .from('GoalEntries')
            .update({
                'name': updateData.title,
                'description': updateData.desc,
                'target_date': updateData.target_date,
                'isCompleted': updateData.isCompleted
            })
            .eq('goal_id', updateData.id)
            .eq('user_id', clerk_user_id)

        if (updateError) {
            console.log(updateError)
            return res.json({ status: false, message: "error while updating goal" })
        }

        return res.json({ status: true })

    } catch (error) {
        console.log(error)
    }
}

export const DeleteGoal = async (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', "")
    if (!token) return res.json({ status: false, message: "unauthorized call" })

    try {
        const decoded = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY
        })
        const clerk_user_id = decoded.sub
        if (!clerk_user_id) { return res.json({ status: false, message: "session expired , login back" }) }
        const goal_id = req.query.goalId
        const { error: deleteError } = await supabase
            .from('GoalEntries')
            .delete()
            .eq('goal_id', goal_id)
            .eq('user_id', clerk_user_id)

        if (deleteError) {
            console.log(deleteError)
            return res.json({ status: false, message: "error while deleting goal" })
        }
        return res.json({ status: true })

    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "unexpected error occurred" })
    }
} 