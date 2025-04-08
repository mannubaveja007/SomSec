import { Router } from 'express'

/* IMPORT ALL YOUR ROUTERS */
import { appRouter, detectionRouter } from '@/modules'

// Import the chat route
const chatRoute = require('./routes/chat-route')

const router = Router()

/* ASSIGN EACH ROUTER TO DEDICATED SUBROUTE */
router.use('/app', appRouter)
router.use('/detection', detectionRouter)

// Register the chat route directly at /chat to match frontend requests
router.use('/chat', chatRoute)

export { router }
