import express from 'express'
import multer from 'multer'
import { createEntry, deleteEntry, getEntriesList, getEntryById, reanalyzeEntry, updateTitle } from '../controllers/entryController';
import { aiBurstLimiter, aiDailyLimiter, standardDbLimiter } from '../middleware/rateLimiter';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.post("/createEntry", aiDailyLimiter, aiBurstLimiter, upload.single('audio'), createEntry)
router.get("/getEntryById", standardDbLimiter, getEntryById)
router.patch("/updateTitle", standardDbLimiter, updateTitle)
router.get("/reanalyzeEntry", aiDailyLimiter, aiBurstLimiter, reanalyzeEntry)
router.get("/getEntriesList", standardDbLimiter, getEntriesList)
router.delete("/deleteEntry", standardDbLimiter, deleteEntry)

export default router