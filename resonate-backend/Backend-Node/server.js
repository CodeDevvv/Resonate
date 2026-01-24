import express from "express"
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv';


const app = express()
app.use(cors())
app.use(express.json())
config();

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

const PORT = 5000
const HOST = '0.0.0.0'

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)
    socket.on('join_entry', (entryId) => {
        // Room for that entryId
        socket.join(entryId)
        console.log(`Socket ${socket.id} joined room: ${entryId}`);
    })
    socket.on('diconnect', () => {
        console.log('User disconnected:', socket.id);
    })
})

app.use((req, res, next) => {
    req.io = io;
    next();
})

app.get("/", (req, res) => {
    console.log("Server running")
    console.log("db connected")
    return res.write(`<h1>Hello, Welcome</h1>`)
})

import entryRoutes from './routes/entryRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

// Routes
app.use('/api/entries', entryRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightRoutes);

// Using socket.io , so not 'app', it's server
server.listen(PORT, HOST, () => {
    console.log('Server started successfully!');
    console.log('---------------------------------------');
    console.log(`Local:    http://localhost:${PORT}`);
    console.log(`Network:  http://${HOST}:${PORT}`);
    console.log('---------------------------------------');
});