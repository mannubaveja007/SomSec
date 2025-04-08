/**
 * Utility function to properly format contract code for API requests
 * @param {string} name - Contract name
 * @param {string} code - Raw contract code
 * @returns {Object} Formatted data for different use cases
 */
function formatContractForAPI(name, code) {
    // First, ensure code is a string
    if (code === null || code === undefined) {
        code = '';
    }
    
    // Thoroughly sanitize and escape the code for JSON
    // This handles all control characters, quotes, and special characters
    const sanitizedCode = String(code)
        .replace(/[\r]/g, '') // Remove carriage returns
        .replace(/[\n]/g, '\n') // Replace newlines with \n literal
        .replace(/[\t]/g, '\t') // Replace tabs with \t literal
        .replace(/[\b]/g, '\b') // Replace backspace with \b literal
        .replace(/[\f]/g, '\f') // Replace form feed with \f literal
        .replace(/[\\'"]/g, '\\$&') // Escape backslashes and quotes
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove other control characters
    
    // Use JSON.stringify to properly escape the contract code
    // This ensures all special characters are properly handled
    const jsonSafeCode = JSON.stringify(code).slice(1, -1);
    
    return {
        // For direct use in API calls
        requestObject: {
            contractName: name,
            contractCode: code  // Raw code for direct API calls
        },
        
        // For copying to Postman (JSON format)
        postmanJson: JSON.stringify({
            contractName: name,
            contractCode: code  // Let JSON.stringify handle the escaping
        }, null, 2),
        
        // For cURL command - use the JSON.stringify'ed object for safety
        curlCommand: `curl -X POST http://localhost:3000/api/detection/analyze-contract \
     -H "Content-Type: application/json" \
     -d '${JSON.stringify({contractName: name, contractCode: code})}'`
    };
}

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
    
    // History elements
    const historyContainer = document.getElementById('historyContainer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Buttons
    const sampleBtn = document.getElementById('sampleBtn');
    const copyPostmanBtn = document.getElementById('copyPostmanBtn');
    const copyCurlBtn = document.getElementById('copyCurlBtn');
    
    // Local storage key for history
    const HISTORY_STORAGE_KEY = 'smartContractAnalysisHistory';
    
    // Current history index for navigation
    let currentHistoryIndex = -1;
    
    // Navigation buttons
    const prevHistoryBtn = document.getElementById('prevHistory');
    const nextHistoryBtn = document.getElementById('nextHistory');

    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // History navigation - properly bound to the buttons
    prevHistoryBtn.addEventListener('click', function() {
        console.log('Previous history button clicked');
        const history = loadHistory();
        if (history.length > 0 && currentHistoryIndex < history.length - 1) {
            loadHistoryItem(currentHistoryIndex + 1);
            console.log('Navigated to older item, new index:', currentHistoryIndex);
        } else {
            console.log('Cannot navigate to older item, index:', currentHistoryIndex, 'length:', history.length);
        }
    });
    
    nextHistoryBtn.addEventListener('click', function() {
        console.log('Next history button clicked');
        if (currentHistoryIndex > 0) {
            loadHistoryItem(currentHistoryIndex - 1);
            console.log('Navigated to newer item, new index:', currentHistoryIndex);
        } else {
            console.log('Cannot navigate to newer item, index:', currentHistoryIndex);
        }
    });
    
    function updateNavigationButtonsState() {
        const history = loadHistory();
        const prevBtn = document.getElementById('prevHistory');
        const nextBtn = document.getElementById('nextHistory');
        
        if (currentHistoryIndex >= history.length - 1) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        
        if (currentHistoryIndex <= 0) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    }

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

    // Function to show alerts
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
    
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
            showAlert('Failed to copy to clipboard', 'danger');
        });
    }

    // Copy Postman JSON with current contract data
    copyPostmanBtn.addEventListener('click', function() {
        const name = contractName.value.trim() || "MyContract";
        const code = contractCode.value.trim() || "pragma solidity ^0.8.0;\n\ncontract MyContract {\n    // Your contract code here\n}";
        
        const formatted = formatContractForAPI(name, code);
        copyToClipboard(formatted.postmanJson, this, 'Copy JSON');
    });

    // Copy cURL command with current contract data
    copyCurlBtn.addEventListener('click', function() {
        const name = contractName.value.trim() || "MyContract";
        const code = contractCode.value.trim() || "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyContract {\n    // Your contract code here\n}";
        
        const formatted = formatContractForAPI(name, code);
        copyToClipboard(formatted.curlCommand, this, 'Copy Command');
    });

    // History management functions
    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    function saveHistory(history) {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    function addToHistory(data) {
        const history = loadHistory();
        const historyItem = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            contractName: contractName.value,
            contractCode: contractCode.value,
            result: data
        };
        
        // Add new item at the beginning
        history.unshift(historyItem);
        
        // Keep only the last 10 items
        if (history.length > 10) {
            history.pop();
        }
        
        saveHistory(history);
        renderHistory();
        currentHistoryIndex = 0; // Set to the newest item
    }

    function renderHistory() {
        const history = loadHistory();
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyContainer.classList.add('d-none');
            prevHistoryBtn.disabled = true;
            nextHistoryBtn.disabled = true;
            return;
        }
        
        historyContainer.classList.remove('d-none');
        
        history.forEach((item, index) => {
            const severity = item.result.overallRisk || 'Unknown';
            const date = new Date(item.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            const listItem = document.createElement('div');
            listItem.className = `history-item ${index === currentHistoryIndex ? 'history-item-active' : ''}`;
            listItem.dataset.index = index;
            
            let severityClass = '';
            switch (severity.toLowerCase()) {
                case 'high': severityClass = 'text-danger'; break;
                case 'medium': severityClass = 'text-warning'; break;
                case 'low': severityClass = 'text-success'; break;
                default: severityClass = 'text-secondary';
            }
            
            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${item.contractName}</strong>
                        <small class="d-block text-muted">${formattedDate}</small>
                    </div>
                    <div>
                        <span class="badge ${severityClass}">Risk: ${severity}</span>
                        <button class="btn btn-sm btn-link text-danger delete-history" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            historyList.appendChild(listItem);
        });
        
        // Add event listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.delete-history')) return; // Don't trigger for delete button
                
                const index = parseInt(this.dataset.index);
                loadHistoryItem(index);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-history').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                deleteHistoryItem(id);
            });
        });
    }

    function loadHistoryItem(index) {
        const history = loadHistory();
        if (index < 0 || index >= history.length) {
            console.error('Invalid history index:', index, 'history length:', history.length);
            return;
        }
        
        currentHistoryIndex = index;
        const item = history[index];
        
        if (!item) {
            console.error('History item not found at index:', index);
            return;
        }
        
        // Fill form with historical data
        contractName.value = item.contractName || '';
        contractCode.value = item.contractCode || '';
        
        // Display results
        initialState.classList.add('d-none');
        loadingResults.classList.add('d-none');
        resultsContent.classList.remove('d-none');
        
        if (item.result) {
            displayResults(item.result);
        } else {
            console.warn('No result data in history item');
            resultsContainer.innerHTML = '<div class="alert alert-warning">No analysis results available for this item</div>';
        }
        
        // Update navigation buttons
        updateHistoryNavigation();
        
        // Re-render to update active state
        renderHistory();
        
        // Log success
        console.log('Loaded history item at index:', index);
    }

    function deleteHistoryItem(id) {
        const history = loadHistory();
        const filteredHistory = history.filter(item => item.id !== id);
        saveHistory(filteredHistory);
        
        if (filteredHistory.length === 0) {
            // Reset view if no history left
            resetView();
        } else if (currentHistoryIndex >= filteredHistory.length) {
            // If current index is out of bounds, set to the last item
            currentHistoryIndex = filteredHistory.length - 1;
            loadHistoryItem(currentHistoryIndex);
        } else {
            // Just re-render to update the list
            renderHistory();
            updateHistoryNavigation();
        }
    }

    function resetView() {
        contractName.value = '';
        contractCode.value = '';
        initialState.classList.remove('d-none');
        loadingResults.classList.add('d-none');
        resultsContent.classList.add('d-none');
        currentHistoryIndex = -1;
        renderHistory();
    }

    // Function to update history navigation buttons
    function updateHistoryNavigation() {
        const history = loadHistory();
        
        // Update previous button (older items)
        prevHistoryBtn.disabled = currentHistoryIndex >= history.length - 1 || history.length === 0;
        
        // Update next button (newer items)
        nextHistoryBtn.disabled = currentHistoryIndex <= 0 || history.length === 0;
    }
    
    // Format JSON button - Formats current contract for Postman
    const formatJsonBtn = document.getElementById('formatJsonBtn');
    if (formatJsonBtn) {
        formatJsonBtn.addEventListener('click', function() {
            const name = contractName.value.trim();
            const code = contractCode.value.trim();
            
            if (!name || !code) {
                showAlert('Please provide both contract name and code', 'warning');
                return;
            }
            
            const formatted = formatContractForAPI(name, code);
            navigator.clipboard.writeText(formatted.postmanJson)
                .then(() => {
                    showAlert('Formatted JSON copied to clipboard for Postman!', 'success');
                })
                .catch(() => {
                    showAlert('Failed to copy to clipboard', 'danger');
                });
        });
    }
    
    // Format cURL button - Formats current contract for cURL
    const formatCurlBtn = document.getElementById('formatCurlBtn');
    if (formatCurlBtn) {
        formatCurlBtn.addEventListener('click', function() {
            const name = contractName.value.trim();
            const code = contractCode.value.trim();
            
            if (!name || !code) {
                showAlert('Please provide both contract name and code', 'warning');
                return;
            }
            
            const formatted = formatContractForAPI(name, code);
            navigator.clipboard.writeText(formatted.curlCommand)
                .then(() => {
                    showAlert('cURL command copied to clipboard!', 'success');
                })
                .catch(() => {
                    showAlert('Failed to copy to clipboard', 'danger');
                });
        });
    }
    
    // Initialize history on page load
    renderHistory();
    updateHistoryNavigation();

    // Clear all history
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all analysis history?')) {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
            resetView();
            renderHistory();
        }
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
        
        // Sanitize and validate input before sending to API
        const contractNameValue = contractName.value.trim();
        const contractCodeValue = contractCode.value.trim();
        
        // Basic validation
        if (!contractNameValue) {
            showAlert('Contract name is required', 'warning');
            enableForm();
            return;
        }
        
        if (!contractCodeValue) {
            showAlert('Contract code is required', 'warning');
            enableForm();
            return;
        }
        
        // Create clean request data object
        const requestData = {
            contractName: contractNameValue,
            contractCode: contractCodeValue
        };
        
        console.log('Submitting contract for analysis:', requestData.contractName, 'Code length:', requestData.contractCode.length);
        
        // Helper function to enable form elements after request
        function enableForm() {
            analyzeBtn.disabled = false;
            analyzeSpinner.classList.add('d-none');
        }
        
        // Call API with safe JSON stringification
        const requestBody = JSON.stringify(requestData);
        console.log('Request payload created, payload size:', requestBody.length);
        
        fetch('/api/detection/analyze-contract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })
        .then(response => {
            console.log('Response received, status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(`API error: ${response.status} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error analyzing contract:', error);
            
            // Show detailed error message in results area
            const errorMessage = error.message || 'Failed to analyze contract. Please try again.';
            let errorDetail = '';
            
            // Provide specific guidance for common errors
            if (errorMessage.includes('SyntaxError') || errorMessage.includes('JSON')) {
                errorDetail = 'Your contract may contain special characters that need escaping. Try removing any unusual characters or formatting.';
            } else if (errorMessage.includes('timeout') || errorMessage.includes('Network')) {
                errorDetail = 'Network connectivity issue. Please check your connection and try again.';
            }
            
            // Display the error in the results area
            vulnerabilities.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="bi bi-exclamation-triangle"></i> Error Analysis Failed</h5>
                    <p><strong>Details:</strong> ${errorMessage}</p>
                    ${errorDetail ? `<p><strong>Suggestion:</strong> ${errorDetail}</p>` : ''}
                    <hr>
                    <p class="mb-0">If this problem persists, please try with a simpler contract or contact support.</p>
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
        
        // Add navigation buttons if we're viewing history
        if (currentHistoryIndex >= 0) {
            // Update navigation buttons state
            updateNavigationButtonsState();
        }
        
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
