import { Router } from 'express'

/* IMPORT ALL YOUR ROUTERS */
import { appRouter, detectionRouter } from '@/modules'

const router = Router()

/* ASSIGN EACH ROUTER TO DEDICATED SUBROUTE */
router.use('/app', appRouter)
router.use('/detection', detectionRouter)

export { router }
