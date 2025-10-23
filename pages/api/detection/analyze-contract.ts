import 'reflect-metadata'
import type { NextApiRequest, NextApiResponse } from 'next'
import { plainToInstance } from 'class-transformer'
import { AnalyzeContractRequest } from '../../../src/modules/detection-module/dtos/requests'
import { DetectionService } from '../../../src/modules/detection-module/service'
import { validateRequest } from '../../../src/helpers'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
        responseLimit: '50mb',
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Create and validate the request object
        const request = plainToInstance(AnalyzeContractRequest, req.body)
        await validateRequest(request)

        // Analyze the smart contract
        const analysisResult = await DetectionService.analyzeSmartContract(
            request.contractCode,
            request.contractName
        )

        // Send the analysis result as JSON
        res.status(200).json(analysisResult)
    } catch (error) {
        console.error('Error in analyzeContractHandler:', error)
        res.status(400).json({
            error: true,
            message: error instanceof Error ? error.message : String(error),
        })
    }
}
