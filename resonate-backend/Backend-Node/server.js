import express from "express"
const app = express()

import { config } from 'dotenv';
config();

import cors from 'cors'
app.use(cors())
app.use(express.json())


import AudioRouter from "./Routes/AudioRouters.js"
import DiaryRouter from "./Routes/DiaryRouter.js"
import InsightsRouter from "./Routes/InsightsRouter.js"
import GoalRouter from "./Routes/GoalRouter.js"

app.get("/", (req, res) => {
    console.log("Server running")
    console.log("db connected")
})

// Routes
app.use("/audio", AudioRouter)
app.use("/diary", DiaryRouter)
app.use("/insights", InsightsRouter)
app.use('/goals', GoalRouter)

app.listen(5000, () => {
    console.log('App listening on port 5000!');
});