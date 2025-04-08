// Direct serverless implementation for analyze-contract endpoint
const { default: fetch } = require('node-fetch');
require('dotenv').config();

// Simplified handler without complex imports
module.exports = async (req, res) => {
  console.log('Analyze contract serverless function called');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: true, message: 'Method not allowed' });
    }

    // Extract contract details from request
    const { contractName, contractCode } = req.body;
    console.log(`Analyzing contract: ${contractName}, code length: ${contractCode?.length || 0}`);

    // Validate inputs
    if (!contractName || typeof contractName !== 'string') {
      return res.status(400).json({ error: true, message: 'Contract name is required and must be a string' });
    }
    
    if (!contractCode || typeof contractCode !== 'string') {
      return res.status(400).json({ error: true, message: 'Contract code is required and must be a string' });
    }
    
    // Generate prompt for the AI analysis
    const prompt = `
      Analyze the following smart contract for security vulnerabilities, code quality issues, and best practices:
      
      Contract Name: ${contractName}
      
      Contract Code:
      \`\`\`solidity
      ${contractCode}
      \`\`\`
      
      Provide a comprehensive security analysis focusing on:
      1. Known vulnerabilities (e.g., reentrancy, overflow/underflow, front-running)
      2. Code quality issues
      3. Gas optimization opportunities
      4. Compliance with best practices
      
      For each issue found:
      - Describe the vulnerability/issue
      - Explain the potential impact
      - Suggest a fix or improvement
      
      Format your response as a JSON object with the following structure:
      {
        "overallRisk": "High/Medium/Low",
        "summary": "Brief executive summary of findings",
        "vulnerabilities": [
          {
            "name": "Vulnerability name",
            "severity": "Critical/High/Medium/Low/Informational",
            "description": "Detailed description",
            "location": "Function/line reference",
            "recommendation": "How to fix"
          }
        ],
        "codeQuality": {
          "issues": [...],
          "recommendations": [...]
        },
        "gasOptimization": {
          "issues": [...],
          "recommendations": [...]
        }
      }
    `;
    
    // API key from environment variables
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.error('TOGETHER_API_KEY is not set in the environment variables');
      return res.status(500).json({ 
        error: true, 
        message: 'API key not configured on the server' 
      });
    }
    
    // Call Together AI API
    console.log('Making request to Together AI');
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    // Check for API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: true, 
        message: `AI provider error: ${response.status} - ${errorText}` 
      });
    }
    
    // Parse and return the analysis
    const analysisData = await response.json();
    console.log('Analysis completed successfully');
    
    // Extract the content from the AI response
    let result;
    try {
      if (analysisData.choices && analysisData.choices[0] && analysisData.choices[0].message) {
        const content = analysisData.choices[0].message.content;
        result = JSON.parse(content);
      } else {
        result = analysisData;
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        error: true,
        message: 'Failed to parse AI response',
        rawResponse: analysisData
      });
    }

    // Return the analysis results
    return res.status(200).json(result);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: true,
      message: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
