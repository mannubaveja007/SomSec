import { Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'

import { AnalyzeContractRequest } from '../dtos/requests'
import { DetectionService } from '../service'
import { validateRequest } from '@/helpers'

/**
 * Controller for analyzing smart contracts
 */
export const analyzeContractHandler = async (req: Request, res: Response) => {
    try {
        // Create and validate the request object
        const request = plainToInstance(AnalyzeContractRequest, req.body)
        await validateRequest(request)

        // Analyze the smart contract
        const analysisResult = await DetectionService.analyzeSmartContract(request.contractCode)

        // Send the analysis result as JSON
        res.json(analysisResult)
    } catch (error) {
        console.error('Error in analyzeContractHandler:', error)
        res.status(400).json({
            error: true,
            message: error instanceof Error ? error.message : String(error),
        })
    }
}
