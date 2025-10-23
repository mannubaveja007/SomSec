import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { prompt } = req.body

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' })
        }

        // Configure your Together AI API request using native fetch
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a smart contract security expert. Provide detailed and helpful responses to questions about smart contract vulnerabilities and security best practices.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 1024,
            }),
        })

        const data = (await response.json()) as any

        if (data.error) {
            console.error('Together AI API error:', data.error)
            return res.status(500).json({ error: data.error.message || 'Error calling AI service' })
        }

        // Extract the response text
        const aiResponse =
            data.choices && data.choices[0] && data.choices[0].message
                ? data.choices[0].message.content
                : 'Sorry, I was unable to generate a response. Please try again.'

        return res.status(200).json({ response: aiResponse })
    } catch (error) {
        console.error('Error in chat route:', error)
        res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        })
    }
}
