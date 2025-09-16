# Somnia Smart Contract Security Analyzer

A powerful AI-driven security analysis tool for Somnia smart contracts, helping developers identify and fix vulnerabilities before deployment on the Somnia network.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Testing](#testing)
- [Frontend Navigation](#frontend-navigation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Test Cases](#test-cases)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

Somnia Smart Contract Security Analyzer leverages advanced AI (Google Gemini 1.5 Pro) to analyze Solidity smart contracts and detect potential security vulnerabilities on the Somnia network. It provides detailed security analysis with risk levels, specific vulnerability identification, and recommendations for enhancing contract security.

## Features

- **Smart Contract Analysis**: Analyze Solidity code to detect vulnerabilities and security risks
- **Risk Assessment**: Get an overall risk score and detailed breakdown of identified issues
- **Vulnerability Visualization**: View a heatmap of your contract showing risk areas
- **Comparison Tool**: Compare analyses of different versions of contracts
- **Educational Resources**: Learn about smart contract security best practices
- **Interactive AI Chat**: Ask questions about your contract's security and get AI-powered answers
- **API Integration**: Use our API for integration into your development workflow

## Project Structure

```
venn-smart-contract/
├── .git/                   # Git repository
├── src/                    # Source code
│   ├── app.ts              # Main application entry point
│   ├── router.ts           # Main router configuration
│   ├── errors/             # Error handling
│   ├── helpers/            # Helper utilities
│   ├── modules/            # Feature modules
│   │   ├── app-module/     # Core application module
│   │   └── detection-module/  # Smart contract detection module
│   ├── public/             # Static files for frontend
│   │   ├── css/            # Stylesheets
│   │   ├── js/             # Frontend JavaScript
│   │   └── images/         # Images and icons
│   ├── routes/             # API routes
│   ├── tests/              # Unit tests within src
│   └── types/              # TypeScript type definitions
├── tests/                  # Integration tests
├── docs/                   # Documentation files
├── .env.example            # Example environment variables
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/venn-smart-contract.git
   cd venn-smart-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   PORT=3000
   HOST=localhost
   LOG_LEVEL=trace
   GEMINI_API_KEY=your_gemini_api_key_here
   SOMNIA_CHAIN_ID=50312
   SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
   SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network/
   SOMNIA_SYMBOL=STT
   ```

## Running the Application

### Backend Setup

The backend server provides API endpoints for smart contract analysis and security checks.

1. Development mode with hot-reloading:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

3. Preview the built application:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

4. Production mode:
   ```bash
   npm run start
   # or
   yarn start
   ```

The server will be accessible at `http://localhost:3000` (or the port you specified in the .env file).

### Frontend Setup

The frontend is served from the Express backend and includes HTML, CSS, and JavaScript files in the `src/public` directory.

1. After starting the backend server, the frontend will be automatically available at the same address (`http://localhost:3000`).

2. No separate frontend server is needed as the web interface is served directly from the backend.

### Development Mode

During development, the application will automatically reload when you make changes to the source code. This is handled by nodemon configuration.

Changes to frontend files in the `src/public` directory will be available on browser refresh.

### Production Mode

For production deployment:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

## Testing

Run the test suite with:

```bash
npm run test
# or
yarn test
```

For continuous testing during development:

```bash
npm run test:watch
# or
yarn test:watch
```

The test suite includes:

- API endpoint tests
- Smart contract detection functionality tests
- Integration tests for the full analysis workflow

## Frontend Navigation

The web interface provides several sections for analyzing smart contracts:

1. **Home Page**: Upload or paste your Solidity smart contract
2. **Analysis Dashboard**: View the comprehensive security analysis after submitting a contract:
   - Overall risk score
   - Vulnerability breakdown by category
   - Code with highlighted risk areas
   - Detailed recommendations

3. **Contract Comparison**: Compare different versions of your contracts to track security improvements

4. **Learning Center**: Access educational resources about smart contract security

5. **AI Chat**: Ask questions about your contract or general security best practices and receive AI-powered answers

## Usage Guide

### Analyzing a Smart Contract

1. Paste your Solidity smart contract code into the input area
2. Click the "Analyze Contract" button
3. View the analysis results, including:
   - Overall risk assessment
   - Detailed vulnerability breakdown
   - Code-specific recommendations

### Using the Chat Assistant

1. Analyze a contract to activate the chat functionality
2. Navigate to the Chat tab
3. Ask questions about your contract's security
4. Get AI-generated responses specifically tailored to your contract

### Comparing Contracts

1. Save multiple contract analyses
2. Go to the Comparison tab
3. Select two analyses to compare
4. View the differences in vulnerabilities, recommendations, and risk levels

### Visualization

The Visualization tab provides a heatmap of your contract code, highlighting areas of high, medium, and low risk to help you visually identify problem areas.

## API Documentation

### Smart Contract Analysis Endpoint

```
POST /api/detection/analyze-contract
```

Request Body:
```json
{
  "contractName": "YourContractName",
  "contractCode": "Your Solidity code here..."
}
```

Response:
```json
{
  "contractName": "YourContractName",
  "overallRisk": "Medium",
  "summary": "Summary of findings",
  "vulnerabilities": [
    {
      "type": "Reentrancy",
      "severity": "High",
      "description": "Description of vulnerability",
      "location": "function withdraw()",
      "lineNumbers": [45, 52],
      "recommendation": "Use ReentrancyGuard or checks-effects-interactions pattern"
    }
  ],
  "recommendations": {
    "immediate": ["Fix reentrancy in withdraw function"],
    "consideration": ["Consider using OpenZeppelin's SafeMath"]
  }
}
```

### Chat Endpoint

```
POST /api/chat
```

Request Body:
```json
{
  "prompt": "Ask a question about the contract or security best practices"
}
```

Response:
```json
{
  "response": "AI-generated response to your question"
}
```

## Test Cases

### Test Case 1: Basic ERC20 Contract

**Input**: Standard ERC20 token contract
**Expected Results**: 
- Low to Medium risk assessment
- Identification of any missing access controls
- Recommendations for adding proper access control mechanisms

### Test Case 2: Contract with Reentrancy Vulnerability

**Input**: Contract with `call.value()` before state changes
**Expected Results**:
- High risk assessment
- Identification of reentrancy vulnerability
- Recommendation to implement checks-effects-interactions pattern

### Test Case 3: Contract with Integer Overflow

**Input**: Contract with unchecked arithmetic operations
**Expected Results**:
- Medium to High risk assessment
- Identification of potential overflow/underflow issues
- Recommendation to use SafeMath or Solidity 0.8+ built-in overflow checks

### Test Case 4: Contract with Timestamp Dependency

**Input**: Contract using `block.timestamp` for critical decisions
**Expected Results**:
- Medium risk assessment
- Warning about miner manipulation of timestamps
- Recommendation for more secure time-handling strategies

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express
- **AI Integration**: Google Gemini 1.5 Pro
- **Network**: Somnia Testnet (Chain ID: 50312)
- **Visualization**: D3.js for vulnerability heatmap

## Contributing

We welcome contributions to improve this tool! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini AI model
- Somnia network for the innovative blockchain platform
- OpenZeppelin for smart contract security best practices
- The blockchain community for valuable feedback and testing
