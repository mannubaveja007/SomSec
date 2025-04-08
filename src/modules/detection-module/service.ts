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

            // Create a prompt for smart contract analysis with specific vulnerability classes
            const prompt = `Analyze the following smart contract for vulnerabilities and security issues. Perform a balanced security audit focusing on truly significant risks that could allow developers or attackers to drain funds, disable withdrawals, or compromise contract integrity. Avoid flagging minor issues or standard patterns as serious vulnerabilities - focus only on meaningful security threats with real-world impact. Be conservative when labeling issues as high or critical severity.

Perform a detailed analysis for these specific vulnerability classes:

1. REENTRANCY ATTACK VECTORS:
   - Multi-function reentrancy: Check for vulnerable state changes across multiple functions
   - Same-function reentrancy: Analyze single function vulnerable to reentrancy
   - Cross-contract reentrancy: Examine vulnerability when interacting with other contracts
   - Read-only reentrancy: Check for reentrancy in view functions affecting other operations
   - Analyze usage of nonReentrant modifiers and adherence to checks-effects-interactions pattern

2. ACCESS CONTROL VULNERABILITIES:
   - Missing access controls: Functions without proper authorization
   - Insufficient validation: Weak permission checks
   - Centralization risks: Single admin/owner points of failure
   - Missing two-step ownership transfers
   - Insecure role management: Issues with role assignments/revocations
   - Privilege escalation vectors: Ways to gain unauthorized privileges

3. ARITHMETIC VULNERABILITIES:
   - Integer overflow/underflow (pre-Solidity 0.8.0)
   - Precision loss: Issues with division before multiplication
   - Rounding errors: Inaccuracies in calculations
   - Truncation issues: Loss of decimal precision
   - Unchecked math operations in Solidity 0.8.0+ (using unchecked blocks)
   - Gas griefing through excessive computations

4. TRANSACTION ORDERING VULNERABILITIES:
   - Front-running opportunities: Exploitable transaction sequencing
   - Back-running: Opportunistic transactions after a target tx
   - Sandwich attacks: Profit from transactions before and after target tx
   - MEV (Miner/Validator Extractable Value) vulnerabilities
   - Missing transaction deadlines or delays for sensitive operations

5. ORACLE AND PRICE MANIPULATION:
   - Single oracle dependence: Relying on a single data source
   - Stale data usage: Not checking data freshness
   - Flash loan attack vectors: Price manipulation using flash loans
   - Missing TWAP (Time-Weighted Average Price) implementation
   - Spot price dependence without proper safeguards

6. BUSINESS LOGIC VULNERABILITIES:
   - Logic sequence flaws: Incorrect operation ordering
   - State inconsistency: Contradictory contract states
   - Circular logic: Endless loops or recursion
   - Missing edge cases: Unhandled scenarios
   - Incorrect mathematical formulas
   - Economic attacks: Profit from protocol design flaws

7. DENIAL-OF-SERVICE VECTORS:
   - Block gas limit DoS: Functions exceeding block gas limits
   - Looping operations with unbounded iterations
   - External call failures affecting contract functionality
   - Resource exhaustion attacks
   - Deliberate contract locking techniques

8. GAS OPTIMIZATION ISSUES:
   - Inefficient storage usage: SLOAD/SSTORE operations
   - Redundant calculations: Computing the same value multiple times
   - Unnecessary event emissions
   - Suboptimal data types or state variable packing
   - Expensive loop operations that could be optimized

9. TIME AND RANDOMNESS MANIPULATION:
   - block.timestamp manipulation (within miner's margin)
   - block.number manipulation for time calculations
   - blockhash limitations for randomness
   - Predictable pseudo-random number generation
   - Missing VRF (Verifiable Random Function) for critical randomness

10. HIDDEN CONTROL MECHANISMS:
    - Obfuscated admin functions
    - Backdoor functions with misleading names
    - Hardcoded addresses with special privileges
    - Assembly code hiding critical control logic
    - Indirect control through external contract calls
    - Trojanized initialization functions

11. UPGRADEABILITY VULNERABILITIES (if applicable):
    - Storage collision in upgradeable contracts
    - Initialization flaws: Missing initializers or reinitializable contracts
    - Delegatecall vulnerabilities in proxy patterns
    - Function selector clashes between implementation and proxy
    - Unstructured storage pattern risks

12. ERC STANDARD COMPLIANCE ISSUES (if applicable):
    - Missing or incorrect ERC standard functions
    - Non-standard behavior in standard functions
    - Rebase tokens logical flaws
    - Fee-on-transfer token handling issues
    - SafeERC20 usage for external token interactions

13. SOLIDITY COMPILER SPECIFIC ISSUES:
    - Known vulnerabilities in specific compiler versions
    - Outdated compiler version with security flaws
    - Missing or incorrect pragma directives
    - Assembly code usage risks
    - Constructor visibility issues in older Solidity

14. CONTRACT COMPOSABILITY RISKS:
    - Cross-contract reentrancy risks
    - Unexpected interactions between contracts
    - Flash loan attack surfaces
    - Composability risks with external DeFi protocols
    - Missing pull-over-push pattern for value transfers

For each vulnerability, provide:
- Line numbers where the vulnerability exists (be specific, not just function level)
- Exploitability assessment (how difficult it is to exploit with detailed reasoning)
- Potential impact (financial, operational, etc. with quantification where possible)
- Sample exploit code illustrating the attack vector
- Concrete fix recommendation with code example that addresses the root cause
- Risk category mapping to OWASP/DASP10 where applicable

Very important guidelines to reduce false positives:
1. Only report issues that are definitely vulnerabilities, not theoretical edge cases
2. For a vulnerability to be considered "Critical" or "High" severity, it must have direct and significant financial impact
3. Do not flag gas optimization issues as security vulnerabilities
4. Standard development patterns (like centralized admin controls) should not be flagged as vulnerabilities unless they're implemented unsafely
5. Consider contract context - what might be a vulnerability in one context could be intentional design in another
6. Be conservative in your assessment - when in doubt, assign lower severity ratings or classify as informational
7. Do not report missing NatSpec comments or documentation as vulnerabilities

Format your response as a JSON object with the following structure:
{
  "vulnerabilities": [
    {
      "type": "string", // e.g., "Reentrancy", "Access Control", etc.
      "category": "string", // The main category from the list above
      "subcategory": "string", // The specific sub-type of vulnerability
      "severity": "string", // "Critical", "High", "Medium", "Low", "Informational"
      "description": "string", // Detailed description of the vulnerability
      "location": "string", // Function or code section where the vulnerability exists
      "lineNumbers": [1, 2, 3], // Line numbers where the vulnerability exists
      "exploitability": "string", // "Easy", "Moderate", "Difficult"
      "impact": "string", // Description of the potential impact
      "codeSnippet": "string", // Relevant code snippet
      "exploitExample": "string", // Example of how the vulnerability could be exploited
      "recommendation": "string", // How to fix the vulnerability
      "fixExample": "string", // Example code fix
      "owasp": "string" // Related OWASP/DASP10 category if applicable
    }
  ],
  "overallRisk": "string", // "Critical", "High", "Medium", "Low", "Safe"
  "summary": "string", // Brief summary of the contract's security status
  "securePatterns": [ // Highlighting good security practices used in the contract
    {
      "pattern": "string", // e.g., "Checks-Effects-Interactions"
      "location": "string", // Where this secure pattern is implemented
      "strength": "string" // How effective this implementation is
    }
  ],
  "recommendations": { // Overall recommendations
    "immediate": ["string"], // Critical fixes needed immediately
    "consideration": ["string"] // Improvements to consider
  },
  "metrics": {
    "cyclomatic_complexity": number, // Code complexity metric
    "high_risk_functions": ["string"], // List of highest risk functions
    "external_dependencies": ["string"], // External contracts depended on
    "modification_scope": "string" // How much code needs changing to fix issues
  }
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
