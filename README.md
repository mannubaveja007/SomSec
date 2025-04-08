# Smart Contract Security Analysis Tool

An AI-powered security analysis tool for Ethereum smart contracts that helps developers identify and fix vulnerabilities before deployment.

## Overview

This application uses advanced AI (Together AI with meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8) to analyze Solidity smart contracts and detect potential security vulnerabilities. It provides detailed analysis with risk levels, specific vulnerability identification, and recommendations for making your contracts more secure.

## Key Features

- **Smart Contract Analysis**: Analyze Solidity code to detect vulnerabilities and security risks
- **Risk Assessment**: Get an overall risk score and detailed breakdown of identified issues
- **Vulnerability Visualization**: View a heatmap of your contract showing risk areas
- **Comparison Tool**: Compare analyses of different versions of contracts
- **Educational Resources**: Learn about smart contract security best practices
- **Interactive AI Chat**: Ask questions about your contract's security and get AI-powered answers
- **API Integration**: Use our API for integration into your development workflow

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Together AI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-contract-security-analysis.git
   cd smart-contract-security-analysis
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Together AI API key:
   ```
   TOGETHER_API_KEY=your_api_key_here
   PORT=3000
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

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
- **AI Integration**: Together AI (meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8)
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

- Together AI for providing the AI model
- OpenZeppelin for smart contract security best practices
- The Ethereum community for valuable feedback and testing
