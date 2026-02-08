import express from "express";
import { addGoal, deleteGoal, getGoals, updateGoal } from "../controllers/goalController";

const router = express.Router();

router.post('/addGoal', addGoal)
router.get('/getGoals', getGoals)
router.put('/updateGoal', updateGoal)
router.delete('/deleteGoal', deleteGoal)

export default router