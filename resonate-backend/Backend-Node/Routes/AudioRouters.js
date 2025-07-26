import express from 'express'
import { FetchDetails, getAnalysis, GetAudio, SaveAudio, SetTitle } from '../Controllers/AudioController.js'
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.post("/saveAudio", upload.single('audio'), SaveAudio)
router.post("/getAudio", GetAudio)
router.get("/fetchDetails", FetchDetails)
router.patch("/setTitle", SetTitle)
router.post("/runAnalysis", getAnalysis)

export default router