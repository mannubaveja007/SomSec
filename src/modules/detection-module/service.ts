import { DetectionRequest, DetectionResponse } from './dtos'
import { Together } from 'together-ai'
import dotenv from 'dotenv'

dotenv.config()

/**
 * DetectionService
 *
 * Implements a `detect` method that receives an enriched view of an
 * EVM compatible transaction (i.e. `DetectionRequest`)
 * or a smart contract code for vulnerability analysis
 * and returns a `DetectionResponse`
 *
 * API Reference:
 * https://github.com/ironblocks/venn-custom-detection/blob/master/docs/requests-responses.docs.md
 */
export class DetectionService {
    private static togetherClient: Together | null = null;

    /**
     * Initialize the Together AI client
     */
    private static initializeTogetherClient(): Together {
        if (!this.togetherClient) {
            const apiKey = process.env.TOGETHER_API_KEY;
            if (!apiKey) {
                throw new Error('TOGETHER_API_KEY is not set in environment variables');
            }
            this.togetherClient = new Together({
                apiKey: apiKey
            });
        }
        return this.togetherClient;
    }

    /**
     * Detect smart contract vulnerabilities using Together AI
     */
    public static async analyzeSmartContract(smartContractCode: string): Promise<any> {
        try {
            const client = this.initializeTogetherClient();

            // Create a prompt for smart contract analysis
            const prompt = `Analyze the following smart contract for vulnerabilities and security issues. The analysis should focus on finding potential security risks that could allow developers to drain funds or disable withdrawals. Provide a detailed response describing any vulnerabilities found, their severity, and recommendations for fixing them. Format your response as a JSON object with the following structure:
{
  "vulnerabilities": [
    {
      "type": "string", // e.g., "Reentrancy", "Access Control", etc.
      "severity": "string", // "High", "Medium", "Low"
      "description": "string", // Detailed description of the vulnerability
      "location": "string", // Function or code section where the vulnerability exists
      "recommendation": "string" // How to fix the vulnerability
    }
  ],
  "overallRisk": "string", // "High", "Medium", "Low", "Safe"
  "summary": "string" // Brief summary of the contract's security status
}

Here is the smart contract to analyze:

${smartContractCode}`;

            const response = await client.chat.completions.create({
                model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            try {
                const content = response.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No content in AI response');
                }
                const result = JSON.parse(content);
                return result;
            } catch (error) {
                return {
                    error: true,
                    message: "Failed to parse AI response",
                    content: response.choices[0]?.message?.content || 'No content available'
                };
            }
        } catch (error) {
            console.error('Error analyzing smart contract:', error);
            return {
                error: true,
                message: `Error analyzing smart contract: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    /**
     * Detect vulnerabilities from a standard detection request
     */
    public static async detect(request: DetectionRequest): Promise<DetectionResponse> {
        try {
            // Extract relevant code/data from the request for analysis
            // For this implementation, we'll check if the contract code is available in the pre/post state
            const contractAddress = request.trace.to;
            const contractCode = request.trace.post[contractAddress]?.code || '';
            
            // If there's no contract code to analyze, return a basic response
            if (!contractCode) {
                return new DetectionResponse({
                    request,
                    detectionInfo: {
                        detected: false,
                        message: 'No contract code available for analysis',
                    },
                });
            }

            // Analyze the contract code
            const analysis = await this.analyzeSmartContract(contractCode);
            
            // Determine if any severe vulnerabilities were detected
            const hasVulnerabilities = analysis.vulnerabilities && 
                analysis.vulnerabilities.length > 0 && 
                analysis.vulnerabilities.some((v: any) => v.severity === 'High' || v.severity === 'Medium');

            return new DetectionResponse({
                request,
                detectionInfo: {
                    detected: hasVulnerabilities,
                    message: analysis.summary || 'Contract analyzed',
                    additionalData: analysis
                },
            });
        } catch (error) {
            console.error('Error in detect method:', error);
            return new DetectionResponse({
                request,
                detectionInfo: {
                    error: true,
                    detected: false,
                    message: `Error during detection: ${error instanceof Error ? error.message : String(error)}`,
                },
            });
        }
    }
}
