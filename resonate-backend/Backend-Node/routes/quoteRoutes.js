import express from 'express'
import { getDailyQuote } from '../controllers/quoteController'
const router = express.Router()

router.get("/getDailyQuote", getDailyQuote)

export default router
