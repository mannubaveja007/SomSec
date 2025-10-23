import 'reflect-metadata'
import type { NextApiRequest, NextApiResponse } from 'next'
import { plainToInstance } from 'class-transformer'
import { createLogger, validateRequest } from '@/helpers'
import { DetectionRequest, toDetectionResponse } from '@/modules/detection-module/dtos'
import { DetectionService } from '@/modules/detection-module/service'
import { RequestError } from '@/errors/http.errors'

const logger = createLogger()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const request = plainToInstance(DetectionRequest, req.body)

    logger.debug(`detect request started. Request id: ${request.id}`)

    try {
        // validate request
        await validateRequest(request)

        // perform business logic
        const result = await DetectionService.detect(request)

        logger.debug('detect request finished successfully')

        // return response
        res.status(200).json(toDetectionResponse(result))
    } catch (error) {
        // handle errors - Next.js compatible error handling
        let statusCode = 500
        let message = 'Internal Server Error'

        if (error instanceof RequestError) {
            statusCode = error.code
            message = error.message
        } else if (error instanceof Error) {
            message = error.message
        }

        logger.error({ message, statusCode })
        res.status(statusCode).json({ error: true, message })
    }
}
