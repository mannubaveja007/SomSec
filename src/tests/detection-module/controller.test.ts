import { detect } from '../../modules/detection-module/controller/detect';
import { DetectionService } from '../../modules/detection-module/service';
import { Request, Response } from 'express';

// Mock the DetectionService
jest.mock('../../modules/detection-module/service', () => ({
  DetectionService: {
    detect: jest.fn()
  }
}));

describe('Detection Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {
        contractName: 'TestContract',
        contractCode: 'contract TestContract {}'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Reset the mock
    jest.clearAllMocks();
  });

  it('should detect vulnerabilities correctly and return results', async () => {
    // Arrange
    const mockDetectionResult = {
      detected: true,
      message: 'Vulnerabilities detected',
      additionalData: {
        vulnerabilities: [{
          type: 'Reentrancy',
          severity: 'High',
          description: 'Test description'
        }],
        overallRisk: 'High',
        summary: 'Test summary'
      }
    };
    
    (DetectionService.detect as jest.Mock).mockResolvedValue(mockDetectionResult);

    // Act
    await detect(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(DetectionService.detect).toHaveBeenCalledWith(expect.objectContaining({
      trace: expect.objectContaining({
        post: expect.objectContaining({
          '0x123': expect.objectContaining({
            code: 'contract TestContract {}'
          })
        })
      })
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      vulnerabilities: expect.any(Array),
      overallRisk: 'High',
      summary: 'Test summary'
    }));
  });

  it('should handle validation errors when contractCode is missing', async () => {
    // Arrange
    mockRequest.body = {
      contractName: 'Test'
      // No contractCode
    };

    // Act
    await detect(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Contract code is required'
    }));
    expect(DetectionService.detect).not.toHaveBeenCalled();
  });

  it('should handle errors thrown by the DetectionService', async () => {
    // Arrange
    (DetectionService.detect as jest.Mock).mockRejectedValue(new Error('Test error'));

    // Act
    await detect(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
