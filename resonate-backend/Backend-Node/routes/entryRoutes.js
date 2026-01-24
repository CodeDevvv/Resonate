import express from 'express'
import multer from 'multer'
import { createEntry, deleteEntry, getEntriesList, getEntryById, reanalyzeEntry, updateTitle } from '../controllers/entryController';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.post("/createEntry", upload.single('audio'), createEntry)
router.get("/getEntryById", getEntryById)
router.patch("/updateTitle", updateTitle)
router.get("/reanalyzeEntry", reanalyzeEntry)
router.get("/getEntriesList", getEntriesList)
router.delete("/deleteEntry", deleteEntry)

export default router