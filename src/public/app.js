document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const contractForm = document.getElementById('contractForm');
    const contractName = document.getElementById('contractName');
    const contractCode = document.getElementById('contractCode');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeSpinner = document.getElementById('analyzeSpinner');
    
    // Results elements
    const loadingResults = document.getElementById('loadingResults');
    const resultsContent = document.getElementById('resultsContent');
    const initialState = document.getElementById('initialState');
    const riskAlert = document.getElementById('riskAlert');
    const overallRisk = document.getElementById('overallRisk');
    const summary = document.getElementById('summary');
    const vulnerabilities = document.getElementById('vulnerabilities');
    
    // Buttons
    const sampleBtn = document.getElementById('sampleBtn');
    const copyPostmanBtn = document.getElementById('copyPostmanBtn');
    const copyCurlBtn = document.getElementById('copyCurlBtn');

    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Sample contract with a vulnerability
    const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}`;

    // Load sample contract
    sampleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        contractName.value = "VulnerableBank";
        contractCode.value = sampleContract;
    });

    // Copy to clipboard functionality
    function copyToClipboard(text, button, originalText = 'Copy') {
        navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = `<i class="bi bi-check"></i> Copied!`;
            setTimeout(() => {
                button.innerHTML = `<i class="bi bi-clipboard"></i> ${originalText}`;
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
            button.textContent = 'Copy failed!';
        });
    }

    // Copy Postman JSON
    copyPostmanBtn.addEventListener('click', function() {
        const jsonText = `{
  "contractName": "MyContract",
  "contractCode": "pragma solidity ^0.8.0;\n\ncontract MyContract {\n    // Your contract code here\n}"
}`;
        copyToClipboard(jsonText, this, 'Copy JSON');
    });

    // Copy cURL command
    copyCurlBtn.addEventListener('click', function() {
        const curlCommand = `curl -X POST http://localhost:3000/api/detection/analyze-contract \
     -H "Content-Type: application/json" \
     -d '{"contractName": "MyContract", "contractCode": "// Your contract code here"}'`;
        copyToClipboard(curlCommand, this, 'Copy Command');
    });

    // Analyze smart contract
    contractForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        analyzeBtn.disabled = true;
        analyzeSpinner.classList.remove('d-none');
        loadingResults.classList.remove('d-none');
        initialState.classList.add('d-none');
        resultsContent.classList.add('d-none');
        
        // Prepare request data
        const requestData = {
            contractName: contractName.value,
            contractCode: contractCode.value
        };
        
        // Call API
        fetch('/api/detection/analyze-contract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Show error in results area
            vulnerabilities.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${error.message || 'Failed to analyze contract. Please try again.'}
                </div>
            `;
            resultsContent.classList.remove('d-none');
            loadingResults.classList.add('d-none');
        })
        .finally(() => {
            // Reset button state
            analyzeBtn.disabled = false;
            analyzeSpinner.classList.add('d-none');
        });
    });

    // Display analysis results
    function displayResults(data) {
        // Update risk level and summary
        overallRisk.textContent = data.overallRisk || 'Unknown';
        summary.textContent = data.summary || 'No summary provided.';
        
        // Make sure the results container adjusts height properly
        document.querySelector('.results-container').classList.add('show-results');
        
        // Set risk alert color based on overall risk
        riskAlert.className = 'alert mb-3';
        if (data.overallRisk) {
            const risk = data.overallRisk.toLowerCase();
            if (risk === 'high') {
                riskAlert.classList.add('high');
            } else if (risk === 'medium') {
                riskAlert.classList.add('medium');
            } else if (risk === 'low') {
                riskAlert.classList.add('low');
            } else if (risk === 'safe') {
                riskAlert.classList.add('safe');
            }
        }
        
        // Display vulnerabilities
        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
            let vulnHtml = '';
            
            data.vulnerabilities.forEach(vuln => {
                const severityClass = vuln.severity ? vuln.severity.toLowerCase() : '';
                
                vulnHtml += `
                    <div class="vulnerability-card ${severityClass} p-3 mb-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0">${vuln.type || 'Unknown Vulnerability'}</h6>
                            <span class="severity-badge ${severityClass}">${vuln.severity || 'Unknown'}</span>
                        </div>
                        <p class="mb-2">${vuln.description || 'No description provided.'}</p>
                        ${vuln.location ? `<p class="mb-2"><strong>Location:</strong> <code>${vuln.location}</code></p>` : ''}
                        ${vuln.recommendation ? `
                            <div class="mt-2">
                                <strong>Recommendation:</strong>
                                <p class="mb-0">${vuln.recommendation}</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            vulnerabilities.innerHTML = vulnHtml;
        } else {
            vulnerabilities.innerHTML = `
                <div class="alert alert-success">
                    No vulnerabilities detected! This contract appears to be safe.
                </div>
            `;
        }
        
        // Show results and hide loading
        resultsContent.classList.remove('d-none');
        loadingResults.classList.add('d-none');
    }
});
