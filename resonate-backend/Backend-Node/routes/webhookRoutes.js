import express from 'express'
import { handleAiResult } from '../controllers/webhookController'
const router = express.Router()

router.post("/handleAiResult", handleAiResult)

export default router
