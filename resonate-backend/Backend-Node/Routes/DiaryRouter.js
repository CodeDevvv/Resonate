import express from "express";
import { DeleteEntry, FetchDairyEntries, getTFTD, refetchAnalysis } from "../Controllers/DiaryControllers.js";

const router = express.Router()

router.get("/fetchDairyEntries", FetchDairyEntries)
router.delete("/deleteEntry", DeleteEntry)
router.get("/thoughtOfTheDay", getTFTD)
router.get("/refetchAnalysis", refetchAnalysis)

export default router