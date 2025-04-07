import { Router } from 'express'

import * as DetectionController from './controller'

const detectionRouter = Router()

// Standard detection endpoint
detectionRouter.post('/', DetectionController.detect)

// Smart contract analysis endpoint
detectionRouter.post('/analyze-contract', DetectionController.analyzeContractHandler)

export { detectionRouter }
