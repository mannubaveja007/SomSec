/**
 * Smart Contract Visualization Module
 * Provides visual representation of contract risk areas and risk assessment
 */

// Configuration for the visualization
const visualizationConfig = {
    severity: {
        'Critical': '#ff0000',
        'High': '#ff6600',
        'Medium': '#ffcc00',
        'Low': '#ffff00',
        'Informational': '#00ccff',
        'Safe': '#00cc00'
    },
    categoryColors: {
        'REENTRANCY': '#FF5733',
        'ACCESS_CONTROL': '#C70039',
        'ARITHMETIC': '#900C3F',
        'TRANSACTION_ORDERING': '#581845',
        'ORACLE': '#2471A3',
        'BUSINESS_LOGIC': '#148F77',
        'DENIAL_OF_SERVICE': '#D4AC0D',
        'GAS_OPTIMIZATION': '#A6ACAF',
        'TIME_RANDOMNESS': '#633974',
        'HIDDEN_CONTROL': '#E74C3C',
        'UPGRADEABILITY': '#8E44AD',
        'ERC_STANDARD': '#3498DB',
        'COMPILER': '#1ABC9C',
        'COMPOSABILITY': '#F39C12'
    },
    riskWeights: {
        'Critical': 5,
        'High': 4,
        'Medium': 3,
        'Low': 2,
        'Informational': 1,
        'Safe': 0
    },
    // Category display names for UI
    categoryNames: {
        'REENTRANCY': 'Reentrancy',
        'ACCESS_CONTROL': 'Access Control',
        'ARITHMETIC': 'Arithmetic',
        'TRANSACTION_ORDERING': 'Tx Ordering',
        'ORACLE': 'Oracle',
        'BUSINESS_LOGIC': 'Logic Flaws',
        'DENIAL_OF_SERVICE': 'DoS',
        'GAS_OPTIMIZATION': 'Gas',
        'TIME_RANDOMNESS': 'Time & Random',
        'HIDDEN_CONTROL': 'Hidden Control',
        'UPGRADEABILITY': 'Upgradeability',
        'ERC_STANDARD': 'ERC Standards',
        'COMPILER': 'Compiler',
        'COMPOSABILITY': 'Composability'
    }
};

/**
 * Renders a contract risk heatmap showing vulnerable areas in the code
 * @param {Object} analysisResult - The analysis result from the API
 * @param {string} contractCode - The original contract code
 * @param {string} containerId - The container element ID to render the visualization
 */
function renderContractRiskHeatmap(analysisResult, contractCode, containerId = 'contractVisualization') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous visualization
    container.innerHTML = '';
    
    // Create visualization wrapper with tabs for different views
    const wrapper = document.createElement('div');
    wrapper.className = 'contract-viz-wrapper';
    
    // Create tab navigation
    const tabNav = document.createElement('ul');
    tabNav.className = 'nav nav-tabs mb-3';
    tabNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link active" id="heatmap-tab" data-bs-toggle="tab" href="#heatmap-view">Code Heatmap</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="radar-tab" data-bs-toggle="tab" href="#radar-view">Risk Radar</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" id="summary-tab" data-bs-toggle="tab" href="#summary-view">Risk Summary</a>
        </li>
    `;
    wrapper.appendChild(tabNav);
    
    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    
    // Create heatmap tab (default view)
    const heatmapTab = document.createElement('div');
    heatmapTab.className = 'tab-pane fade show active';
    heatmapTab.id = 'heatmap-view';
    
    // Create header for heatmap view
    const header = document.createElement('div');
    header.className = 'mb-3';
    header.innerHTML = `<h5>Code Risk Heatmap</h5>
                       <div class="d-flex align-items-center">
                           <span class="me-2">Overall Risk Level:</span>
                           <div class="risk-meter">
                               ${createRiskMeter(analysisResult.overallRisk)}
                           </div>
                       </div>`;
    heatmapTab.appendChild(header);
    
    // Create code container with line numbers and highlighting
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container risk-visualization position-relative';
    
    // Split code into lines and create HTML
    const lines = contractCode.split('\n');
    const heatmapOverlay = createHeatmapOverlay(analysisResult, lines.length);
    
    // Create code element with line numbers
    const codeElement = document.createElement('pre');
    codeElement.className = 'line-numbers language-solidity';
    codeElement.innerHTML = `<code class="language-solidity">${escapeHTML(lines.join('\n'))}</code>`;
    
    // Add heatmap overlay and code to the container
    codeContainer.appendChild(heatmapOverlay);
    codeContainer.appendChild(codeElement);
    heatmapTab.appendChild(codeContainer);
    
    // Add legend to heatmap view
    heatmapTab.appendChild(createRiskLegend());
    
    // Add the heatmap tab to the tab content
    tabContent.appendChild(heatmapTab);
    
    // Create radar chart tab
    const radarTab = document.createElement('div');
    radarTab.className = 'tab-pane fade';
    radarTab.id = 'radar-view';
    
    // Create radar chart container
    const radarContainer = document.createElement('div');
    radarContainer.className = 'radar-container';
    radarContainer.innerHTML = `
        <h5 class="mb-3">Risk Category Distribution</h5>
        <div class="row">
            <div class="col-md-8">
                <canvas id="risk-radar-chart" width="400" height="300"></canvas>
            </div>
            <div class="col-md-4">
                <div class="category-risk-list"></div>
            </div>
        </div>
    `;
    radarTab.appendChild(radarContainer);
    
    // Create summary tab
    const summaryTab = document.createElement('div');
    summaryTab.className = 'tab-pane fade';
    summaryTab.id = 'summary-view';
    summaryTab.innerHTML = `
        <h5 class="mb-3">Security Analysis Summary</h5>
        <div class="summary-container">
            <div class="card mb-3">
                <div class="card-header bg-${getSeverityClass(analysisResult.overallRisk).replace('text-white', '').replace('text-dark', '').trim()}">
                    <h5 class="card-title mb-0 text-white">Overall Risk Assessment: ${analysisResult.overallRisk}</h5>
                </div>
                <div class="card-body">
                    <p class="summary-text">${analysisResult.summary}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header bg-danger text-white">
                            <h5 class="card-title mb-0">Immediate Actions</h5>
                        </div>
                        <div class="card-body">
                            <ul class="immediate-actions-list">
                                ${analysisResult.recommendations?.immediate?.map(rec => `<li>${rec}</li>`).join('') || '<li>No immediate actions required</li>'}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="card-title mb-0">Considerations</h5>
                        </div>
                        <div class="card-body">
                            <ul class="considerations-list">
                                ${analysisResult.recommendations?.consideration?.map(rec => `<li>${rec}</li>`).join('') || '<li>No additional considerations</li>'}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    <h5 class="card-title mb-0">Secure Patterns Identified</h5>
                </div>
                <div class="card-body">
                    <div class="secure-patterns-list">
                        ${analysisResult.securePatterns?.length ? 
                          '<ul>' + analysisResult.securePatterns.map(pattern => 
                            `<li><strong>${pattern.pattern}</strong>: ${pattern.location} <span class="badge bg-info">${pattern.strength || 'Good'}</span></li>`
                          ).join('') + '</ul>' : 
                          '<p>No secure patterns identified</p>'}
                    </div>
                </div>
            </div>
            ${analysisResult.metrics ? `
            <div class="card mb-3">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">Code Metrics</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Cyclomatic Complexity:</strong> ${analysisResult.metrics.cyclomatic_complexity || 'N/A'}</p>
                            <p><strong>Modification Scope:</strong> ${analysisResult.metrics.modification_scope || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>High Risk Functions:</strong></p>
                            <ul>
                                ${analysisResult.metrics.high_risk_functions?.map(func => `<li>${func}</li>`).join('') || '<li>None identified</li>'}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>` : ''}
        </div>
    `;
    
    tabContent.appendChild(radarTab);
    tabContent.appendChild(summaryTab);
    wrapper.appendChild(tabContent);
    container.appendChild(wrapper);
    
    // Highlight code with Prism.js
    if (window.Prism) {
        Prism.highlightAll();
    }
    
    // Initialize the radar chart when its tab is shown
    const radarTabElement = document.getElementById('radar-tab');
    if (radarTabElement) {
        radarTabElement.addEventListener('shown.bs.tab', function() {
            renderRiskRadarChart(analysisResult);
        });
    }
}

/**
 * Creates a risk meter visualization based on the overall risk
 * @param {string} riskLevel - The overall risk level
 * @returns {string} HTML for the risk meter
 */
function createRiskMeter(riskLevel) {
    const levels = ['Safe', 'Low', 'Medium', 'High', 'Critical'];
    const index = levels.indexOf(riskLevel) !== -1 ? levels.indexOf(riskLevel) : 2; // Default to Medium
    
    let html = '<div class="risk-meter-container">';
    levels.forEach((level, i) => {
        const active = i <= index ? 'active' : '';
        const color = visualizationConfig.severity[level] || '#ccc';
        html += `<div class="risk-level ${active}" style="background-color: ${color}" title="${level}"></div>`;
    });
    html += '</div>';
    
    return html;
}

/**
 * Creates a heatmap overlay for the code based on vulnerability locations
 * @param {Object} analysisResult - The analysis result from the API
 * @param {number} lineCount - Total number of lines in the code
 * @returns {HTMLElement} The heatmap overlay element
 */
function createHeatmapOverlay(analysisResult, lineCount) {
    const overlay = document.createElement('div');
    overlay.className = 'heatmap-overlay';
    
    // Create a line marker for each line in the code
    for (let i = 0; i < lineCount; i++) {
        const lineMarker = document.createElement('div');
        lineMarker.className = 'line-marker';
        lineMarker.dataset.line = i + 1;
        overlay.appendChild(lineMarker);
    }
    
    // Highlight vulnerable lines based on analysis results
    if (analysisResult.vulnerabilities && analysisResult.vulnerabilities.length > 0) {
        analysisResult.vulnerabilities.forEach(vuln => {
            if (vuln.lineNumbers && vuln.lineNumbers.length > 0) {
                vuln.lineNumbers.forEach(lineNum => {
                    const marker = overlay.querySelector(`[data-line="${lineNum}"]`);
                    if (marker) {
                        marker.classList.add('vulnerable');
                        marker.style.backgroundColor = visualizationConfig.severity[vuln.severity] || '#ffcc00';
                        marker.title = `${vuln.type} (${vuln.severity}): ${vuln.description}`;
                        
                        // Add click event to show details
                        marker.onclick = (e) => {
                            showVulnerabilityDetails(vuln);
                            e.stopPropagation();
                        };
                    }
                });
            }
        });
    }
    
    return overlay;
}

/**
 * Creates a risk legend for the visualization
 * @returns {HTMLElement} The legend element
 */
function createRiskLegend() {
    const legend = document.createElement('div');
    legend.className = 'risk-legend d-flex flex-wrap align-items-center mt-3';
    legend.innerHTML = '<span class="me-2"><strong>Legend:</strong></span>';
    
    Object.entries(visualizationConfig.severity).forEach(([severity, color]) => {
        const item = document.createElement('div');
        item.className = 'legend-item d-flex align-items-center me-3';
        item.innerHTML = `
            <div class="legend-color me-1" style="background-color: ${color}"></div>
            <span>${severity}</span>
        `;
        legend.appendChild(item);
    });
    
    return legend;
}

/**
 * Shows detailed information about a specific vulnerability
 * @param {Object} vulnerability - The vulnerability object
 */
function showVulnerabilityDetails(vulnerability) {
    // Create a modal to show the details
    const modalId = 'vulnerabilityDetailModal';
    let modal = document.getElementById(modalId);
    
    // Create modal if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', `${modalId}Label`);
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">Vulnerability Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="${modalId}Body">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Update modal content
    const modalBody = document.getElementById(`${modalId}Body`);
    
    // Determine severity class for styling
    const severityClass = getSeverityClass(vulnerability.severity);
    
    modalBody.innerHTML = `
        <div class="vulnerability-detail">
            <h5 class="d-flex align-items-center">
                <span class="badge ${severityClass} me-2">${vulnerability.severity}</span>
                ${vulnerability.type}
            </h5>
            
            <p class="mt-3">${vulnerability.description}</p>
            
            <h6>Location:</h6>
            <p>${vulnerability.location}</p>
            
            ${vulnerability.lineNumbers ? `<p>Line(s): ${vulnerability.lineNumbers.join(', ')}</p>` : ''}
            
            ${vulnerability.codeSnippet ? `
                <h6>Vulnerable Code:</h6>
                <pre class="language-solidity"><code class="language-solidity">${escapeHTML(vulnerability.codeSnippet)}</code></pre>
            ` : ''}
            
            <div class="row mt-3">
                <div class="col-md-6">
                    <h6>Exploitability:</h6>
                    <p>${vulnerability.exploitability || 'Not specified'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Impact:</h6>
                    <p>${vulnerability.impact || 'Not specified'}</p>
                </div>
            </div>
            
            ${vulnerability.exploitExample ? `
                <h6>Exploit Example:</h6>
                <pre class="language-solidity"><code class="language-solidity">${escapeHTML(vulnerability.exploitExample)}</code></pre>
            ` : ''}
            
            <h6>Recommendation:</h6>
            <p>${vulnerability.recommendation}</p>
            
            ${vulnerability.fixExample ? `
                <h6>Fix Example:</h6>
                <pre class="language-solidity"><code class="language-solidity">${escapeHTML(vulnerability.fixExample)}</code></pre>
            ` : ''}
        </div>
    `;
    
    // Highlight code if Prism.js is available
    if (window.Prism) {
        Prism.highlightAllUnder(modalBody);
    }
    
    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * Maps severity level to Bootstrap alert class
 * @param {string} severity - The severity level
 * @returns {string} The corresponding Bootstrap class
 */
function getSeverityClass(severity) {
    const severityMap = {
        'Critical': 'bg-danger text-white',
        'High': 'bg-warning text-dark',
        'Medium': 'bg-yellow text-dark',
        'Low': 'bg-info text-dark',
        'Informational': 'bg-primary text-white',
        'Safe': 'bg-success text-white'
    };
    
    return severityMap[severity] || 'bg-secondary text-white';
}

/**
 * Escapes HTML characters in a string
 * @param {string} html - The HTML string to escape
 * @returns {string} The escaped HTML string
 */
function escapeHTML(html) {
    const element = document.createElement('div');
    element.textContent = html;
    return element.innerHTML;
}

/**
 * Renders a radar chart showing the risk distribution across different vulnerability categories
 * @param {Object} analysisResult - The analysis result from the API
 */
function renderRiskRadarChart(analysisResult) {
    // Get the canvas element
    const canvas = document.getElementById('risk-radar-chart');
    if (!canvas || !analysisResult.vulnerabilities || !window.Chart) return;
    
    // Process vulnerability data to extract categories and risk levels
    const categoryData = {};
    const vulnerabilitiesByCategory = {};
    
    // Group vulnerabilities by category
    analysisResult.vulnerabilities.forEach(vuln => {
        const category = vuln.category || getCategoryFromType(vuln.type);
        if (!category) return;
        
        // Initialize category if not exists
        if (!categoryData[category]) {
            categoryData[category] = {
                count: 0,
                riskScore: 0,
                highestSeverity: 'Informational'
            };
            vulnerabilitiesByCategory[category] = [];
        }
        
        // Add to the category
        categoryData[category].count++;
        const severityWeight = visualizationConfig.riskWeights[vuln.severity] || 1;
        categoryData[category].riskScore += severityWeight;
        
        // Update highest severity for this category
        const currentSeverityWeight = visualizationConfig.riskWeights[categoryData[category].highestSeverity] || 0;
        if (severityWeight > currentSeverityWeight) {
            categoryData[category].highestSeverity = vuln.severity;
        }
        
        // Store vulnerability in its category
        vulnerabilitiesByCategory[category].push(vuln);
    });
    
    // Prepare data for radar chart
    const categories = Object.keys(categoryData);
    const riskScores = categories.map(cat => (categoryData[cat].riskScore / categoryData[cat].count) || 0);
    const backgroundColors = categories.map(cat => {
        const color = visualizationConfig.categoryColors[cat] || '#cccccc';
        return color + '80'; // Add transparency
    });
    const borderColors = categories.map(cat => visualizationConfig.categoryColors[cat] || '#cccccc');
    const labels = categories.map(cat => visualizationConfig.categoryNames[cat] || cat);
    
    // Create radar chart
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Risk Score',
            data: riskScores,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            pointBackgroundColor: borderColors,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };
    
    // Chart configuration
    const config = {
        type: 'radar',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Vulnerability Category Risk Distribution'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const category = categories[context.dataIndex];
                            return `${category}: Risk ${context.formattedValue}, ${categoryData[category].count} issues`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    };
    
    // Destroy previous chart if exists
    if (window.riskRadarChart instanceof Chart) {
        window.riskRadarChart.destroy();
    }
    
    // Create new chart
    window.riskRadarChart = new Chart(canvas, config);
    
    // Update category risk list
    updateCategoryRiskList(categories, categoryData, vulnerabilitiesByCategory);
}

/**
 * Updates the category risk list panel
 * @param {Array} categories - List of vulnerability categories
 * @param {Object} categoryData - Data about each category
 * @param {Object} vulnerabilitiesByCategory - Vulnerabilities grouped by category
 */
function updateCategoryRiskList(categories, categoryData, vulnerabilitiesByCategory) {
    const container = document.querySelector('.category-risk-list');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Sort categories by risk score (descending)
    const sortedCategories = [...categories].sort((a, b) => {
        return (categoryData[b].riskScore / categoryData[b].count) - 
               (categoryData[a].riskScore / categoryData[a].count);
    });
    
    // Create category list
    const list = document.createElement('div');
    list.className = 'list-group';
    
    // Add each category as an item
    sortedCategories.forEach(category => {
        const data = categoryData[category];
        const severityClass = getSeverityClass(data.highestSeverity);
        const displayName = visualizationConfig.categoryNames[category] || category;
        
        const item = document.createElement('a');
        item.href = '#';
        item.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center`;
        item.innerHTML = `
            <div>
                <span class="category-name">${displayName}</span>
                <span class="badge ${severityClass} ms-2">${data.highestSeverity}</span>
            </div>
            <span class="badge bg-primary rounded-pill">${data.count}</span>
        `;
        
        // Add click event to show vulnerabilities of this category
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showCategoryVulnerabilities(category, vulnerabilitiesByCategory[category]);
        });
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

/**
 * Shows vulnerabilities for a specific category
 * @param {string} category - The vulnerability category
 * @param {Array} vulnerabilities - The vulnerabilities in that category
 */
function showCategoryVulnerabilities(category, vulnerabilities) {
    const displayName = visualizationConfig.categoryNames[category] || category;
    
    // Create modal for category vulnerabilities
    const modalId = 'categoryVulnerabilitiesModal';
    let modal = document.getElementById(modalId);
    
    // Create modal if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = modalId;
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', `${modalId}Label`);
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">Vulnerabilities: <span class="category-title"></span></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="${modalId}Body">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Update modal content
    const modalTitle = modal.querySelector('.category-title');
    modalTitle.textContent = displayName;
    
    const modalBody = document.getElementById(`${modalId}Body`);
    modalBody.innerHTML = '';
    
    // Create accordion for vulnerabilities
    const accordion = document.createElement('div');
    accordion.className = 'accordion';
    accordion.id = 'categoryVulnerabilityAccordion';
    
    // Add each vulnerability as an accordion item
    vulnerabilities.forEach((vuln, index) => {
        const itemId = `vuln-${index}`;
        const severityClass = getSeverityClass(vuln.severity);
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading-${itemId}">
                <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${itemId}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${itemId}">
                    <span class="badge ${severityClass} me-2">${vuln.severity}</span>
                    <span class="vuln-title">${vuln.type}</span>
                </button>
            </h2>
            <div id="collapse-${itemId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-${itemId}" data-bs-parent="#categoryVulnerabilityAccordion">
                <div class="accordion-body">
                    <p>${vuln.description}</p>
                    <button class="btn btn-sm btn-primary view-details-btn" data-index="${index}">View Full Details</button>
                </div>
            </div>
        `;
        
        accordion.appendChild(accordionItem);
    });
    
    modalBody.appendChild(accordion);
    
    // Add event listeners to detail buttons
    const detailButtons = modalBody.querySelectorAll('.view-details-btn');
    detailButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showVulnerabilityDetails(vulnerabilities[index]);
        });
    });
    
    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * Gets a category name from a vulnerability type
 * @param {string} vulnType - The vulnerability type
 * @returns {string} The category name
 */
function getCategoryFromType(vulnType) {
    // Map vulnerability types to categories
    const typeToCategory = {
        'Reentrancy': 'REENTRANCY',
        'Access Control': 'ACCESS_CONTROL',
        'Integer Overflow': 'ARITHMETIC',
        'Integer Underflow': 'ARITHMETIC',
        'Front-running': 'TRANSACTION_ORDERING',
        'Oracle Manipulation': 'ORACLE',
        'Logic Flaw': 'BUSINESS_LOGIC',
        'Denial of Service': 'DENIAL_OF_SERVICE',
        'Gas Optimization': 'GAS_OPTIMIZATION',
        'Timestamp Dependence': 'TIME_RANDOMNESS',
        'Random Value Manipulation': 'TIME_RANDOMNESS',
        'Hidden Backdoor': 'HIDDEN_CONTROL',
        'Proxy Pattern': 'UPGRADEABILITY',
        'ERC20': 'ERC_STANDARD',
        'ERC721': 'ERC_STANDARD',
        'Compiler Issue': 'COMPILER'
    };
    
    // Check if the type contains any of the keywords
    for (const [keyword, category] of Object.entries(typeToCategory)) {
        if (vulnType.includes(keyword)) {
            return category;
        }
    }
    
    // Default category
    return 'BUSINESS_LOGIC';
}

// Export functions
window.ContractVisualization = {
    renderContractRiskHeatmap,
    showVulnerabilityDetails,
    renderRiskRadarChart
};
