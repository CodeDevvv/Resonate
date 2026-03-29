import express from "express"
import { getInsights } from "../controllers/insightController"
import { standardDbLimiter } from "../middleware/rateLimiter"

const router = express.Router()
router.get('/getInsights', standardDbLimiter, getInsights)
export default router