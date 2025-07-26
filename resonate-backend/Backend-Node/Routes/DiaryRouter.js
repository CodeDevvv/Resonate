import express from "express";
import { DeleteEntry, FetchDetails, getTFTD } from "../Controllers/DiaryControllers.js";

const router = express.Router()

router.get("/fetchDetails", FetchDetails)
router.delete("/deleteEntry", DeleteEntry)
router.get("/thoughtOfTheDay", getTFTD)

export default router