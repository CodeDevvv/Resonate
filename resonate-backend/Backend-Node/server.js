import express from "express"
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv';
import cron from 'node-cron'
import { storageCleanUp } from "./jobs/storageCleanUp.js";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

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

// Socket Connection
io.on('connection', (socket) => {
    console.log('User connected: ', socket.id)
    socket.on('join_entry', (entryId) => {
        // Room for that entryId
        socket.join(entryId)
        console.log(`Socket ${socket.id} joined room: ${entryId}`);
    })
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    })
})

// Attaching socket to API Enpoints 
app.use((req, res, next) => {
    req.io = io;
    next();
})


// scheduling cron job - Run every Sunday at 3:00 AM
cron.schedule("0 3 * * 0", () => {
    storageCleanUp();
});

app.get("/", (req, res) => {
    return res.send(`<h1>Hello, Welcome</h1>`);
})

import entryRoutes from './routes/entryRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/quotes', quoteRoutes);

const requireAuth = ClerkExpressRequireAuth()
app.use('/api/entries', requireAuth, entryRoutes);
app.use('/api/goals', requireAuth, goalRoutes);
app.use('/api/insights', requireAuth, insightRoutes);

app.use((err, req, res, next) => {
    if (err.message === 'Unauthenticated') {
        return res.status(401).json({ error: 'Unauthorized access' });
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Using socket.io , so not 'app', it's server
server.listen(PORT, HOST, () => {
    console.log('Server started successfully!');
    console.log('---------------------------------------');
    console.log(`Local:    http://localhost:${PORT}`);
    console.log(`Network:  http://${HOST}:${PORT}`);
    console.log('---------------------------------------');
});