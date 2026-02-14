import express from "express"
import { getInsights } from "../controllers/insightController"

const router = express.Router()
router.get('/getInsights', getInsights)
export default router