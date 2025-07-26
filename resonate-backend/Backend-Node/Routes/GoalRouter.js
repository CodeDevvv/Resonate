import express from "express"
import { AddGoal, DeleteGoal, GetGoals, UpdateGoal } from "../Controllers/GoalController";

const router = express.Router();

router.post('/addGoal', AddGoal)
router.get('/getGoals', GetGoals)
router.put('/updateGoal', UpdateGoal)
router.delete('/deleteGoal', DeleteGoal)

export default router