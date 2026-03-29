import express from "express";
import { addGoal, deleteGoal, getGoals, updateGoal } from "../controllers/goalController";
import { standardDbLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post('/addGoal', standardDbLimiter, addGoal)
router.get('/getGoals', standardDbLimiter, getGoals)
router.put('/updateGoal', standardDbLimiter, updateGoal)
router.delete('/deleteGoal', standardDbLimiter, deleteGoal)

export default router