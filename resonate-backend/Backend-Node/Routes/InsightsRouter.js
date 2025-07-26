import express from "express"
import { getChartData, getHeatmapData, getTopics } from "../Controllers/InsightsController"

const router = express.Router()

router.get('/getChartData', getChartData)
router.get('/getHeatmapData', getHeatmapData)
router.get('/getFrequentTopics', getTopics)

export default router