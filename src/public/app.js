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
    const sampleBtnTop = document.getElementById('sampleBtnTop');
    const sampleBtnBottom = document.getElementById('sampleBtnBottom');
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

    // Function to load sample contract
    function loadSampleContract(e) {
        e.preventDefault();
        contractName.value = "VulnerableBank";
        contractCode.value = sampleContract;
    }
    
    // Add event listeners to both sample buttons
    if (sampleBtnTop) sampleBtnTop.addEventListener('click', loadSampleContract);
    if (sampleBtnBottom) sampleBtnBottom.addEventListener('click', loadSampleContract);

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
        // Cache the current analysis for visualization and other features
        window.currentAnalysis = data;
        window.currentContractCode = contractCode.value;
        window.currentContractName = contractName.value;
        
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
        riskAlert.className = 'alert mb-0';
        if (data.overallRisk) {
            const risk = data.overallRisk.toLowerCase();
            if (risk === 'high' || risk === 'critical') {
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
        
        // Enable the save button for database storage
        const saveAnalysisBtn = document.getElementById('saveAnalysisBtn');
        if (saveAnalysisBtn) {
            saveAnalysisBtn.disabled = false;
            saveAnalysisBtn.onclick = function() {
                saveAnalysisToDatabase(data, contractCode.value);
            };
        }
        
        // Initialize visualization if we're on that tab or when tab is clicked
        initializeVisualization(data, contractCode.value);
        
        // Initialize educational content based on vulnerabilities found
        initializeEducationalContent(data);
    }
    
    // Function to save analysis to the database
    function saveAnalysisToDatabase(analysis, contractCode) {
        // Check if the database module is loaded
        if (window.AnalysisDB && window.AnalysisDB.db) {
            const analysisName = `${window.currentContractName || 'Contract'} - ${new Date().toLocaleString()}`;
            
            window.AnalysisDB.db.saveAnalysis(analysis, contractCode, analysisName)
                .then((id) => {
                    showAlert(`Analysis saved successfully with ID: ${id}`, 'success');
                    refreshAnalysisHistoryList();
                })
                .catch((error) => {
                    console.error('Error saving analysis:', error);
                    showAlert('Failed to save analysis to database', 'danger');
                });
        } else {
            console.error('Analysis database module not loaded');
            showAlert('Analysis database module not loaded', 'danger');
        }
    }
    
    // Function to refresh the analysis history list
    function refreshAnalysisHistoryList() {
        // Check if the database module is loaded
        if (window.AnalysisDB && window.AnalysisDB.db && window.AnalysisDB.ui) {
            const historyList = document.getElementById('analysis-history-list');
            if (historyList) {
                window.AnalysisDB.db.getAllAnalyses()
                    .then((analyses) => {
                        window.AnalysisDB.ui.renderAnalysisList(analyses, historyList);
                        
                        // Also update the select dropdowns for comparison
                        updateComparisonSelects(analyses);
                    })
                    .catch((error) => {
                        console.error('Error loading analysis history:', error);
                    });
            }
        }
    }
    
    // Function to update the comparison select dropdowns
    function updateComparisonSelects(analyses) {
        const select1 = document.getElementById('analysis1-select');
        const select2 = document.getElementById('analysis2-select');
        const compareBtn = document.getElementById('compare-btn');
        
        if (select1 && select2 && compareBtn) {
            // Clear existing options except the first one
            while (select1.options.length > 1) select1.options.remove(1);
            while (select2.options.length > 1) select2.options.remove(1);
            
            if (analyses && analyses.length > 0) {
                // Enable the selects
                select1.disabled = false;
                select2.disabled = false;
                
                // Add options for each analysis
                analyses.forEach((analysis) => {
                    const option1 = document.createElement('option');
                    option1.value = analysis.id;
                    option1.textContent = analysis.name;
                    select1.appendChild(option1);
                    
                    const option2 = document.createElement('option');
                    option2.value = analysis.id;
                    option2.textContent = analysis.name;
                    select2.appendChild(option2);
                });
                
                // Enable compare button when both selects have a value
                function checkCompareButton() {
                    compareBtn.disabled = !select1.value || !select2.value || select1.value === select2.value;
                }
                
                select1.addEventListener('change', checkCompareButton);
                select2.addEventListener('change', checkCompareButton);
                
                // Add click handler to compare button
                compareBtn.onclick = function() {
                    if (select1.value && select2.value && select1.value !== select2.value) {
                        compareAnalyses(Number(select1.value), Number(select2.value));
                    }
                };
            }
        }
    }
    
    // Function to compare two analyses
    function compareAnalyses(analysis1Id, analysis2Id) {
        if (window.AnalysisDB && window.AnalysisDB.db && window.AnalysisDB.ui) {
            const comparisonResults = document.getElementById('comparison-results');
            if (comparisonResults) {
                // Show loading indicator
                comparisonResults.innerHTML = `
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3">Generating comparison...</p>
                    </div>
                `;
                
                // Perform the comparison
                window.AnalysisDB.db.compareAnalyses(analysis1Id, analysis2Id)
                    .then((comparison) => {
                        window.AnalysisDB.ui.renderComparison(comparison, comparisonResults);
                    })
                    .catch((error) => {
                        console.error('Error comparing analyses:', error);
                        comparisonResults.innerHTML = `
                            <div class="alert alert-danger">
                                <h5>Error Comparing Analyses</h5>
                                <p>${error.message || 'An unknown error occurred'}</p>
                            </div>
                        `;
                    });
            }
        }
    }
    
    // Function to initialize visualization
    function initializeVisualization(analysis, contractCode) {
        if (window.ContractVisualization && window.ContractVisualization.renderContractRiskHeatmap) {
            // Add a listener to the visualization tab
            const visualizationTab = document.getElementById('visualization-tab');
            const visualizationContainer = document.getElementById('contractVisualization');
            
            if (visualizationTab && visualizationContainer) {
                // Initialize visualization when tab is clicked
                visualizationTab.addEventListener('shown.bs.tab', function() {
                    window.ContractVisualization.renderContractRiskHeatmap(analysis, contractCode, 'contractVisualization');
                });
                
                // Also render if we're already on the visualization tab
                if (visualizationTab.classList.contains('active')) {
                    window.ContractVisualization.renderContractRiskHeatmap(analysis, contractCode, 'contractVisualization');
                }
            }
        }
    }
    
    // Function to initialize educational content
    function initializeEducationalContent(analysis) {
        if (window.SmartContractEducation && window.SmartContractEducation.ui) {
            const educationTab = document.getElementById('education-tab');
            const educationalContainer = document.getElementById('educational-container');
            
            if (educationTab && educationalContainer) {
                // Initialize educational content when tab is clicked
                educationTab.addEventListener('shown.bs.tab', function() {
                    window.SmartContractEducation.ui.renderEducationalDashboard(educationalContainer);
                });
            }
        }
    }
    
    // Initialize chat functionality
    function initializeChat() {
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        const chatTab = document.getElementById('chat-tab');
        
        if (chatForm && chatInput && chatMessages) {
            // Load current contract's chat if available
            if (window.currentContractName && window.currentAnalysis) {
                loadContractChat(window.currentContractName);
            }
            
            // Update contract chat history
            updateContractChatHistory();
            
            // Handle form submission
            chatForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!window.currentContractName || !window.currentAnalysis) {
                    appendChatMessage('assistant', 'Please analyze a smart contract first to start a conversation.', false);
                    return;
                }
                
                const message = chatInput.value.trim();
                if (!message) return;
                
                // Add user message to chat
                appendChatMessage('user', message);
                
                // Clear input
                chatInput.value = '';
                
                // Generate a response based on the current analysis
                generateChatResponse(message, window.currentAnalysis);
            });
            
            // Add chat tab click event to update history
            if (chatTab) {
                chatTab.addEventListener('shown.bs.tab', function() {
                    updateContractChatHistory();
                    if (window.currentContractName && window.currentAnalysis) {
                        loadContractChat(window.currentContractName);
                    }
                });
            }
        }
    }
    
    // Function to append a message to the chat
    function appendChatMessage(sender, content, saveToDB = true) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}-message`;
        
        // Format code blocks if present
        const formattedContent = formatMessageContent(content);
        
        if (sender === 'user') {
            messageEl.innerHTML = `
                <div class="p-3 mb-2 bg-primary text-white rounded float-end chat-bubble">
                    <p class="mb-0">${formattedContent}</p>
                </div>
                <div class="clearfix"></div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="p-3 mb-2 bg-light rounded chat-bubble">
                    <p class="mb-0">${formattedContent}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageEl);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to format message content with code blocks
    function formatMessageContent(content) {
        if (!content) return '';
        
        // Replace code blocks with formatted HTML
        let formattedContent = content;
        
        // Format ```code``` blocks
        formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre class="code-block p-2 rounded bg-dark text-light"><code>$1</code></pre>');
        
        // Format inline `code` snippets
        formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code class="p-1 rounded bg-dark text-light">$1</code>');
        
        // Replace newlines with <br>
        formattedContent = formattedContent.replace(/\n/g, '<br>');
        
        return formattedContent;
    }
    
    // Function to save chat history to local storage
    function saveChatHistory() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messages = [];
        const userMessages = chatMessages.querySelectorAll('.user-message .chat-bubble p');
        const assistantMessages = chatMessages.querySelectorAll('.assistant-message .chat-bubble p');
        
        // Build messages array (this is simplistic and could be improved)
        for (let i = 0; i < Math.max(userMessages.length, assistantMessages.length); i++) {
            if (i < userMessages.length) {
                messages.push({
                    sender: 'user',
                    content: userMessages[i].textContent
                });
            }
            
            if (i < assistantMessages.length) {
                messages.push({
                    sender: 'assistant',
                    content: assistantMessages[i].textContent
                });
            }
        }
        
        localStorage.setItem('smartContractChatHistory', JSON.stringify(messages));
    }
    
    // Function to generate a response based on the analysis using the AI API
    function generateChatResponse(userMessage, analysis) {
        // Check if we have analysis data
        if (!analysis) {
            appendChatMessage('assistant', 'Please analyze a smart contract first so I can provide specific insights about it.');
            return;
        }

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Create the context for the AI model
        const prompt = {
            contractName: window.currentContractName || 'Contract',
            contractCode: window.currentContractCode || '',
            analysis: JSON.stringify(analysis),
            userMessage: userMessage
        };

        // Call the chat API endpoint
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: `You're analyzing a Solidity smart contract called ${prompt.contractName}. Here's the security analysis results: ${prompt.analysis}. User question: ${prompt.userMessage}. Provide a helpful, specific response about this contract's security.`
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Display the AI response
            if (data && data.response) {
                appendChatMessage('assistant', data.response);
                
                // Save chat history with contract association
                saveChatWithContractAssociation(userMessage, data.response);
            } else {
                throw new Error('Invalid response from chat API');
            }
        })
        .catch(error => {
            console.error('Error calling chat API:', error);
            
            // Remove typing indicator
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
            
            // Fallback to a generic response
            appendChatMessage('assistant', 'I apologize, but I encountered an issue while generating a response. Could you try asking again or rephrasing your question?');
        });
    }
    
    // Function to save chat with contract association
    function saveChatWithContractAssociation(userMessage, aiResponse) {
        if (!window.currentContractName) return;
        
        // Get existing chat history or initialize a new one
        const chatStorage = localStorage.getItem('smartContractChats') || '{}';
        let contractChats;
        
        try {
            contractChats = JSON.parse(chatStorage);
        } catch (e) {
            console.error('Error parsing chat storage:', e);
            contractChats = {};
        }
        
        // Initialize this contract's chat if it doesn't exist
        if (!contractChats[window.currentContractName]) {
            contractChats[window.currentContractName] = [];
        }
        
        // Add the new messages to this contract's chat
        contractChats[window.currentContractName].push(
            {
                sender: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            },
            {
                sender: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            }
        );
        
        // Save back to localStorage
        localStorage.setItem('smartContractChats', JSON.stringify(contractChats));
        
        // Update contract chat history UI if it exists
        updateContractChatHistory();
    }
    
    // Function to update contract chat history UI
    function updateContractChatHistory() {
        const chatHistoryList = document.getElementById('chat-history-list');
        if (!chatHistoryList) return;
        
        // Clear existing list
        chatHistoryList.innerHTML = '';
        
        // Get all contract chats
        const chatStorage = localStorage.getItem('smartContractChats') || '{}';
        let contractChats;
        
        try {
            contractChats = JSON.parse(chatStorage);
        } catch (e) {
            console.error('Error parsing chat storage:', e);
            contractChats = {};
        }
        
        const contractNames = Object.keys(contractChats);
        
        if (contractNames.length === 0) {
            chatHistoryList.innerHTML = '<div class="p-3 text-muted"><i>No chat history available</i></div>';
            return;
        }
        
        // Create list items for each contract chat
        contractNames.forEach(contractName => {
            const chatCount = contractChats[contractName].filter(msg => msg.sender === 'user').length;
            const lastChat = new Date(contractChats[contractName][contractChats[contractName].length - 1].timestamp);
            
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            if (window.currentContractName === contractName) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${contractName}</div>
                        <small class="text-muted">${chatCount} messages · ${lastChat.toLocaleString()}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger delete-chat-btn" data-contract="${contractName}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click event to load this chat
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.delete-chat-btn')) {
                    loadContractChat(contractName);
                }
            });
            
            chatHistoryList.appendChild(item);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-chat-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const contractName = this.dataset.contract;
                if (contractName) {
                    deleteContractChat(contractName);
                }
            });
        });
    }
    
    // Function to load a specific contract's chat
    function loadContractChat(contractName) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Get contract chats
        const chatStorage = localStorage.getItem('smartContractChats') || '{}';
        let contractChats;
        
        try {
            contractChats = JSON.parse(chatStorage);
        } catch (e) {
            console.error('Error parsing chat storage:', e);
            return;
        }
        
        // If this contract has chat history, load it
        if (contractChats[contractName] && contractChats[contractName].length > 0) {
            contractChats[contractName].forEach(message => {
                appendChatMessage(message.sender, message.content, false);
            });
        } else {
            // Start with a greeting
            appendChatMessage('assistant', `I'm here to help with your ${contractName} smart contract. What would you like to know?`, false);
        }
        
        // Update active state in history list
        const historyItems = document.querySelectorAll('.chat-history-item');
        historyItems.forEach(item => {
            item.classList.remove('active');
            if (item.querySelector('.fw-bold').textContent === contractName) {
                item.classList.add('active');
            }
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to delete a contract's chat
    function deleteContractChat(contractName) {
        if (!contractName) return;
        
        // Get contract chats
        const chatStorage = localStorage.getItem('smartContractChats') || '{}';
        let contractChats;
        
        try {
            contractChats = JSON.parse(chatStorage);
            
            // Delete this contract's chat
            if (contractChats[contractName]) {
                delete contractChats[contractName];
                
                // Save back to localStorage
                localStorage.setItem('smartContractChats', JSON.stringify(contractChats));
                
                // Update UI
                updateContractChatHistory();
                
                // Clear chat display if we were viewing this contract
                if (window.currentContractName === contractName) {
                    const chatMessages = document.getElementById('chat-messages');
                    if (chatMessages) {
                        chatMessages.innerHTML = '';
                        appendChatMessage('assistant', 'Chat history was deleted. What would you like to know about your smart contract?', false);
                    }
                }
                
                showAlert(`Chat history for ${contractName} has been deleted`, 'success');
            }
        } catch (e) {
            console.error('Error deleting chat:', e);
            showAlert('Error deleting chat history', 'danger');
        }
    }
    
    // Initialize features when DOM is loaded
    function initializeFeatures() {
        // Initialize analysis database
        if (window.AnalysisDB && window.AnalysisDB.db) {
            window.AnalysisDB.db.init()
                .then(() => {
                    console.log('Analysis database initialized');
                    refreshAnalysisHistoryList();
                })
                .catch(error => {
                    console.error('Error initializing analysis database:', error);
                });
        }
        
        // Initialize educational content when education tab is clicked
        const educationTab = document.getElementById('education-tab');
        const educationalContainer = document.getElementById('educational-container');
        if (educationTab && educationalContainer && window.SmartContractEducation) {
            educationTab.addEventListener('shown.bs.tab', function() {
                window.SmartContractEducation.ui.renderEducationalDashboard(educationalContainer);
            });
        }
        
        // Initialize chat functionality
        initializeChat();
    }
    
    // Call initialization
    initializeFeatures();
});
