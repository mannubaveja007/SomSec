import { DetectionService } from '../../modules/detection-module/service';
import { Together } from 'together-ai';
import { DetectionRequest } from '../../modules/detection-module/dtos';

// Mock the Together AI client
jest.mock('together-ai', () => {
  return {
    Together: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async () => {
              return {
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        vulnerabilities: [
                          {
                            type: 'Reentrancy',
                            severity: 'High',
                            description: 'This contract is vulnerable to reentrancy attacks.',
                            location: 'withdraw() function',
                            recommendation: 'Use the checks-effects-interactions pattern or a reentrancy guard.'
                          }
                        ],
                        overallRisk: 'High',
                        summary: 'The contract has critical security vulnerabilities.'
                      })
                    }
                  }
                ]
              };
            })
          }
        }
      };
    }),
  };
});

// Cast to unknown first, then to jest.Mock to avoid TypeScript error
const MockTogether = Together as unknown as jest.Mock;

describe('DetectionService', () => {
  
  beforeEach(() => {
    // Reset environment variables before each test
    process.env.TOGETHER_API_KEY = 'test-api-key';
  });

  describe('analyzeSmartContract', () => {
    it('should analyze a smart contract and detect vulnerabilities', async () => {
      // Test contract with a reentrancy vulnerability
      const vulnerableContract = `
        contract VulnerableBank {
          mapping(address => uint) public balances;
          
          function deposit() public payable {
              balances[msg.sender] += msg.value;
          }
          
          function withdraw(uint _amount) public {
              require(balances[msg.sender] >= _amount);
              
              (bool sent, ) = msg.sender.call{value: _amount}("");
              require(sent, "Failed to send Ether");
              
              balances[msg.sender] -= _amount;
          }
        }
      `;

      const result = await DetectionService.analyzeSmartContract(vulnerableContract);
      
      expect(result).toBeDefined();
      expect(result.vulnerabilities).toHaveLength(1);
      expect(result.vulnerabilities[0].type).toBe('Reentrancy');
      expect(result.vulnerabilities[0].severity).toBe('High');
      expect(result.overallRisk).toBe('High');
    });

    it('should handle API errors gracefully', async () => {
      // Create a mock Together client
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      } as unknown as Together;
      
      // Mock the Together constructor
      MockTogether.mockImplementation(() => mockClient);

      const result = await DetectionService.analyzeSmartContract('contract Test {}');
      
      expect(result).toBeDefined();
      expect(result.error).toBe(true);
      expect(result.message).toContain('Error analyzing smart contract');
    });

    it('should handle parsing errors gracefully', async () => {
      // Create a mock Together client
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Invalid JSON response'
                  }
                }
              ]
            })
          }
        }
      } as unknown as Together;
      
      // Mock the Together constructor
      MockTogether.mockImplementation(() => mockClient);

      const result = await DetectionService.analyzeSmartContract('contract Test {}');
      
      expect(result).toBeDefined();
      expect(result.error).toBe(true);
      expect(result.message).toBe('Failed to parse AI response');
    });
  });

  describe('detect', () => {
    it('should detect vulnerabilities in contract code from a transaction', async () => {
      // Create a mock request with contract code
      const mockRequest = new DetectionRequest();
      mockRequest.trace = {
        to: '0x123',
        post: {
          '0x123': {
            code: 'contract VulnerableContract {}'
          }
        }
      } as any;
      
      // Spy on analyzeSmartContract
      jest.spyOn(DetectionService, 'analyzeSmartContract').mockResolvedValue({
        vulnerabilities: [
          {
            type: 'Overflow',
            severity: 'High',
            description: 'Integer overflow vulnerability'
          }
        ],
        overallRisk: 'High',
        summary: 'Critical vulnerabilities detected'
      });

      const result = await DetectionService.detect(mockRequest);
      
      expect(result).toBeDefined();
      expect(result.detected).toBe(true);
      expect(result.message).toBe('Critical vulnerabilities detected');
      expect(result.additionalData).toBeDefined();
      expect(result.additionalData?.vulnerabilities).toHaveLength(1);
    });

    it('should handle cases with no contract code', async () => {
      // Create a mock request with no contract code
      const mockRequest = new DetectionRequest();
      mockRequest.trace = {
        to: '0x123',
        post: {}
      } as any;

      const result = await DetectionService.detect(mockRequest);
      
      expect(result).toBeDefined();
      expect(result.detected).toBe(false);
      expect(result.message).toBe('No contract code available for analysis');
    });

    it('should handle errors during detection', async () => {
      // Create a mock request
      const mockRequest = new DetectionRequest();
      mockRequest.trace = {
        to: '0x123',
        post: {
          '0x123': {
            code: 'contract Test {}'
          }
        }
      } as any;
      
      // Make analyzeSmartContract throw an error
      jest.spyOn(DetectionService, 'analyzeSmartContract').mockRejectedValue(new Error('Analysis failed'));

      const result = await DetectionService.detect(mockRequest);
      
      expect(result).toBeDefined();
      expect(result.detected).toBe(false);
      expect(result.error).toBe(true);
      expect(result.message).toContain('Error during detection');
    });
  });
});
