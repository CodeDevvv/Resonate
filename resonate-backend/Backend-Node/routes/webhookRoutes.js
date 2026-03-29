import express from 'express'
import { handleAiResult } from '../controllers/webhookController'
import { standardDbLimiter } from '../middleware/rateLimiter'
const router = express.Router()

router.post("/handleAiResult", standardDbLimiter, handleAiResult)

export default router
