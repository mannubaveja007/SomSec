![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)

# AI Smart Contract Vulnerability Detector
An advanced smart contract vulnerability detection system built on the Venn Custom Detector boilerplate. This system utilizes Together AI to analyze smart contracts for security vulnerabilities and provide detailed reports.

> 📚 [What is Venn?](https://docs.venn.build/)

## Table of Contents
- [Introduction](#ai-smart-contract-vulnerability-detector)
- [Features](#-features)
- [Quick Start](#quick-start)
- [What's inside?](#-whats-inside)
- [Local development:](#️-local-development)
- [API Reference](#-api-reference)
- [Deploy to production](#-deploy-to-production)

## ✅ Features
- **AI-Powered Analysis**: Uses Together AI's advanced language models to detect vulnerabilities in smart contracts
- **Detailed Reports**: Provides comprehensive analysis with severity ratings and fix recommendations
- **Beautiful UI**: Modern web interface for submitting contracts and viewing results
- **API Access**: Fully documented API for integrating the vulnerability detection into other tools
- **Multiple Vulnerability Detection**: Identifies various common vulnerabilities including:
  - Reentrancy attacks
  - Access control vulnerabilities
  - Integer overflow/underflow
  - Timestamp dependence
  - Front-running vulnerabilities
  - And many more

## ✨ Quick start
1. Clone this repo and install dependencies using `npm install`
2. Create a `.env` file with your Together AI API key (see [Environment Setup](#-local-development))
3. Run `npm run dev` to start the development server
4. Access the web interface at `http://localhost:3000`

    ```ts
    import { DetectionResponse, DetectionRequest } from './dtos'

    /**
     * DetectionService
     *
     * Implements a `detect` method that receives an enriched view of an
     * EVM compatible transaction (i.e. `DetectionRequest`)
     * and returns a `DetectionResponse`
     *
     * API Reference:
     * https://github.com/ironblocks/venn-custom-detection/blob/master/docs/requests-responses.docs.md
     */
    export class DetectionService {
        /**
         * Update this implementation code to insepct the `DetectionRequest`
         * based on your custom business logic
         */
        public static detect(request: DetectionRequest): DetectionResponse {
            
            /**
             * For this "Hello World" style boilerplate
             * we're mocking detection results using
             * some random value
             */
            const detectionResult = Math.random() < 0.5;


            /**
             * Wrap our response in a `DetectionResponse` object
             */
            return new DetectionResponse({
                request,
                detectionInfo: {
                    detected: detectionResult,
                },
            });
        }
    }
    ```

3. Implement your own logic in the `detect` method
4. Run `yarn dev` _(or `npm run dev`)_
5. That's it! Your custom detector service is now ready to inspect transaction

## 📦 What's inside?
This application is built using `Express.js`, and written in `TypeScript` using `NodeJS`. It includes:

- **Together AI Integration**: Analyzes smart contracts using Together AI's language models
- **Modern UI**: Responsive web interface built with Bootstrap 5
- **RESTful API**: Well-documented API for programmatic access
- **Detailed Vulnerability Reports**: Comprehensive analysis with actionable insights

**Supported Smart Contract Analysis**:
- Comprehensive vulnerability detection for Solidity smart contracts
- Security analysis based on industry best practices
- Actionable recommendations for fixing vulnerabilities

## 🛠️ Local Development

**Environment Setup**

Create a `.env` file with:

```bash
PORT=3000
HOST=localhost
LOG_LEVEL=debug
TOGETHER_API_KEY=your_together_api_key_here  # Get this from https://api.together.xyz/
```

**Running In Dev Mode**
```bash
npm install
npm run dev
```

## 📘 API Reference

### Smart Contract Analysis Endpoint

```http
POST /api/detection/analyze-contract
```

**Request Body:**

```json
{
  "contractName": "string", // Name of the contract
  "contractCode": "string"  // Full Solidity contract code
}
```

**Response:**

```json
{
  "vulnerabilities": [
    {
      "type": "string",     // Type of vulnerability (e.g., "Reentrancy")
      "severity": "string", // "High", "Medium", or "Low"
      "description": "string", // Detailed description
      "location": "string", // Function or section with the vulnerability
      "recommendation": "string" // Fix recommendation
    }
  ],
  "overallRisk": "string", // "High", "Medium", "Low", or "Safe"
  "summary": "string"      // Brief summary of findings
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/detection/analyze-contract \
     -H "Content-Type: application/json" \
     -d '{
       "contractName": "SimpleStorage",
       "contractCode": "pragma solidity ^0.8.0;\n\ncontract SimpleStorage {\n    uint256 private storedData;\n\n    function set(uint256 x) public {\n        storedData = x;\n    }\n\n    function get() public view returns (uint256) {\n        return storedData;\n    }\n}"
     }'
```

## 🚀 Deploy To Production

**Manual Build**

```bash
yarn build      # or npm run build
yarn start      # or npm run start
```


**Using Docker**
```bash
docker build -f Dockerfile . -t my-custom-detector
```

