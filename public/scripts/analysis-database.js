/**
 * Smart Contract Analysis Database
 * Manages storing, retrieving, and comparing contract security analyses
 */

// Database configuration
const DB_NAME = 'smart-contract-analysis-db';
const DB_VERSION = 1;
const ANALYSIS_STORE_NAME = 'analysis-results';

/**
 * Database Initialization
 */
class AnalysisDatabase {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the IndexedDB database
     * @returns {Promise} Promise that resolves when the database is ready
     */
    async init() {
        if (this.isInitialized) return Promise.resolve(this.db);

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for analysis results
                if (!db.objectStoreNames.contains(ANALYSIS_STORE_NAME)) {
                    const store = db.createObjectStore(ANALYSIS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    
                    // Create indexes for queries
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('riskLevel', 'riskLevel', { unique: false });
                    store.createIndex('contractHash', 'contractHash', { unique: false });
                }
            };
        });
    }

    /**
     * Save an analysis result to the database
     * @param {Object} analysis - The contract analysis result
     * @param {String} contractCode - The contract code that was analyzed
     * @param {String} name - Optional name for this analysis
     * @returns {Promise} Promise that resolves with the ID of the saved analysis
     */
    async saveAnalysis(analysis, contractCode, name = '') {
        await this.init();

        // Generate a hash of the contract code for easy comparison
        const contractHash = await this.hashString(contractCode);
        
        // Create analysis record
        const analysisRecord = {
            name: name || `Analysis ${new Date().toISOString()}`,
            timestamp: new Date().getTime(),
            riskLevel: analysis.overallRisk,
            contractHash: contractHash,
            vulnerabilityCount: analysis.vulnerabilities ? analysis.vulnerabilities.length : 0,
            analysis: analysis,
            contractCode: contractCode
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ANALYSIS_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(ANALYSIS_STORE_NAME);
            
            const request = store.add(analysisRecord);
            
            request.onsuccess = () => {
                resolve(request.result); // Returns the ID
            };
            
            request.onerror = (event) => {
                console.error('Error saving analysis:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Get all saved analyses from the database
     * @returns {Promise} Promise that resolves with all analyses
     */
    async getAllAnalyses() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ANALYSIS_STORE_NAME], 'readonly');
            const store = transaction.objectStore(ANALYSIS_STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('Error getting analyses:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Get a specific analysis by ID
     * @param {Number} id - The ID of the analysis to retrieve
     * @returns {Promise} Promise that resolves with the analysis
     */
    async getAnalysisById(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ANALYSIS_STORE_NAME], 'readonly');
            const store = transaction.objectStore(ANALYSIS_STORE_NAME);
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('Error getting analysis:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Delete an analysis by ID
     * @param {Number} id - The ID of the analysis to delete
     * @returns {Promise} Promise that resolves when the analysis is deleted
     */
    async deleteAnalysis(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ANALYSIS_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(ANALYSIS_STORE_NAME);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Error deleting analysis:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Find similar analyses based on contract hash
     * @param {String} contractHash - The hash of the contract code
     * @returns {Promise} Promise that resolves with similar analyses
     */
    async findSimilarAnalyses(contractHash) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ANALYSIS_STORE_NAME], 'readonly');
            const store = transaction.objectStore(ANALYSIS_STORE_NAME);
            const index = store.index('contractHash');
            const request = index.getAll(contractHash);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('Error finding similar analyses:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Compare two analyses and highlight differences
     * @param {Number} analysis1Id - The ID of the first analysis
     * @param {Number} analysis2Id - The ID of the second analysis
     * @returns {Promise} Promise that resolves with the comparison result
     */
    async compareAnalyses(analysis1Id, analysis2Id) {
        const [analysis1, analysis2] = await Promise.all([
            this.getAnalysisById(analysis1Id),
            this.getAnalysisById(analysis2Id)
        ]);

        if (!analysis1 || !analysis2) {
            throw new Error('One or both analyses not found');
        }

        // Calculate vulnerability differences
        const vulnerabilityDiff = this.compareVulnerabilities(
            analysis1.analysis.vulnerabilities || [],
            analysis2.analysis.vulnerabilities || []
        );

        // Calculate risk level change
        const riskLevelChange = this.compareRiskLevels(
            analysis1.analysis.overallRisk,
            analysis2.analysis.overallRisk
        );

        // Calculate recommendation differences
        const recommendationDiff = this.compareRecommendations(
            analysis1.analysis.recommendations || {},
            analysis2.analysis.recommendations || {}
        );

        return {
            analysis1: {
                id: analysis1.id,
                name: analysis1.name,
                timestamp: analysis1.timestamp,
                riskLevel: analysis1.riskLevel
            },
            analysis2: {
                id: analysis2.id,
                name: analysis2.name,
                timestamp: analysis2.timestamp,
                riskLevel: analysis2.riskLevel
            },
            vulnerabilityDiff,
            riskLevelChange,
            recommendationDiff,
            timestamp: new Date().getTime()
        };
    }

    /**
     * Compare vulnerabilities between two analyses
     * @param {Array} vulnerabilities1 - Vulnerabilities from first analysis
     * @param {Array} vulnerabilities2 - Vulnerabilities from second analysis
     * @returns {Object} Differences in vulnerabilities
     */
    compareVulnerabilities(vulnerabilities1, vulnerabilities2) {
        // Group vulnerabilities by type and location for easier comparison
        const groupVulnerabilities = (vulns) => {
            const grouped = {};
            vulns.forEach(vuln => {
                const key = `${vuln.type}:${vuln.location}`;
                if (!grouped[key]) {
                    grouped[key] = [];
                }
                grouped[key].push(vuln);
            });
            return grouped;
        };

        const grouped1 = groupVulnerabilities(vulnerabilities1);
        const grouped2 = groupVulnerabilities(vulnerabilities2);

        // Find fixed vulnerabilities (in 1 but not in 2)
        const fixed = [];
        for (const [key, vulns] of Object.entries(grouped1)) {
            if (!grouped2[key]) {
                fixed.push(...vulns);
            }
        }

        // Find new vulnerabilities (in 2 but not in 1)
        const added = [];
        for (const [key, vulns] of Object.entries(grouped2)) {
            if (!grouped1[key]) {
                added.push(...vulns);
            }
        }

        // Find changed vulnerabilities (severity or details changed)
        const changed = [];
        for (const [key, vulns1] of Object.entries(grouped1)) {
            if (grouped2[key]) {
                const vulns2 = grouped2[key];
                
                // If severity changed
                if (vulns1[0].severity !== vulns2[0].severity) {
                    changed.push({
                        before: vulns1[0],
                        after: vulns2[0],
                        change: 'severity'
                    });
                }
            }
        }

        return {
            fixed,
            added,
            changed,
            fixedCount: fixed.length,
            addedCount: added.length,
            changedCount: changed.length,
            totalBefore: vulnerabilities1.length,
            totalAfter: vulnerabilities2.length
        };
    }

    /**
     * Compare risk levels between two analyses
     * @param {String} risk1 - Risk level from first analysis
     * @param {String} risk2 - Risk level from second analysis
     * @returns {Object} Risk level change information
     */
    compareRiskLevels(risk1, risk2) {
        // Risk levels from lowest to highest
        const riskLevels = ['Safe', 'Low', 'Medium', 'High', 'Critical'];
        
        // Get indices of each risk level
        const risk1Index = riskLevels.indexOf(risk1);
        const risk2Index = riskLevels.indexOf(risk2);
        
        // Calculate the change in risk level
        const change = risk2Index - risk1Index;
        
        // Determine if the risk increased, decreased, or stayed the same
        let direction = 'unchanged';
        if (change > 0) {
            direction = 'increased';
        } else if (change < 0) {
            direction = 'decreased';
        }
        
        return {
            before: risk1,
            after: risk2,
            change: Math.abs(change),
            direction
        };
    }

    /**
     * Compare recommendations between two analyses
     * @param {Object} recommendations1 - Recommendations from first analysis
     * @param {Object} recommendations2 - Recommendations from second analysis
     * @returns {Object} Differences in recommendations
     */
    compareRecommendations(recommendations1, recommendations2) {
        const immediate1 = recommendations1.immediate || [];
        const immediate2 = recommendations2.immediate || [];
        const consideration1 = recommendations1.consideration || [];
        const consideration2 = recommendations2.consideration || [];
        
        // Find differences in immediate recommendations
        const immediateAdded = immediate2.filter(rec => !immediate1.includes(rec));
        const immediateRemoved = immediate1.filter(rec => !immediate2.includes(rec));
        
        // Find differences in consideration recommendations
        const considerationAdded = consideration2.filter(rec => !consideration1.includes(rec));
        const considerationRemoved = consideration1.filter(rec => !consideration2.includes(rec));
        
        return {
            immediate: {
                added: immediateAdded,
                removed: immediateRemoved,
                addedCount: immediateAdded.length,
                removedCount: immediateRemoved.length
            },
            consideration: {
                added: considerationAdded,
                removed: considerationRemoved,
                addedCount: considerationAdded.length,
                removedCount: considerationRemoved.length
            }
        };
    }

    /**
     * Create a simple hash of a string for comparison
     * @param {String} str - The string to hash
     * @returns {Promise} Promise that resolves with the hash
     */
    async hashString(str) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

/**
 * UI Module for rendering the comparative analysis
 */
class ComparisonUI {
    /**
     * Render the analysis history list for comparison selection
     * @param {Array} analyses - List of analyses to display
     * @param {HTMLElement} container - The container to render the list in
     */
    static renderAnalysisList(analyses, container) {
        if (!container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        if (!analyses || analyses.length === 0) {
            container.innerHTML = '<p class="text-muted">No previous analyses found</p>';
            return;
        }
        
        // Sort analyses by timestamp (newest first)
        const sortedAnalyses = [...analyses].sort((a, b) => b.timestamp - a.timestamp);
        
        // Create the analysis list
        const listElement = document.createElement('div');
        listElement.className = 'list-group analysis-history-list';
        
        // Add each analysis as a list item
        sortedAnalyses.forEach(analysis => {
            const date = new Date(analysis.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            const severityClass = getSeverityClass(analysis.riskLevel);
            
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            item.dataset.analysisId = analysis.id;
            
            item.innerHTML = `
                <div>
                    <h6 class="mb-1">${escapeHTML(analysis.name)}</h6>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                <div>
                    <span class="badge ${severityClass} me-2">${analysis.riskLevel}</span>
                    <span class="badge bg-secondary">${analysis.vulnerabilityCount} issues</span>
                </div>
            `;
            
            listElement.appendChild(item);
        });
        
        container.appendChild(listElement);
    }

    /**
     * Render a comparison between two analyses
     * @param {Object} comparison - The comparison result
     * @param {HTMLElement} container - The container to render the comparison in
     */
    static renderComparison(comparison, container) {
        if (!container || !comparison) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Create the comparison UI
        const comparisonElement = document.createElement('div');
        comparisonElement.className = 'comparison-result';
        
        // Header with analysis details
        const header = document.createElement('div');
        header.className = 'comparison-header mb-4';
        
        const analysis1Date = new Date(comparison.analysis1.timestamp);
        const analysis2Date = new Date(comparison.analysis2.timestamp);
        
        header.innerHTML = `
            <h5>Comparison Results</h5>
            <div class="row">
                <div class="col-md-5 border-end">
                    <h6>${escapeHTML(comparison.analysis1.name)}</h6>
                    <p class="text-muted">${analysis1Date.toLocaleDateString()}</p>
                    <span class="badge ${getSeverityClass(comparison.analysis1.riskLevel)}">${comparison.analysis1.riskLevel}</span>
                </div>
                <div class="col-md-2 d-flex align-items-center justify-content-center">
                    <i class="bi bi-arrow-right fs-2"></i>
                </div>
                <div class="col-md-5">
                    <h6>${escapeHTML(comparison.analysis2.name)}</h6>
                    <p class="text-muted">${analysis2Date.toLocaleDateString()}</p>
                    <span class="badge ${getSeverityClass(comparison.analysis2.riskLevel)}">${comparison.analysis2.riskLevel}</span>
                </div>
            </div>
        `;
        
        comparisonElement.appendChild(header);
        
        // Risk level change
        const riskChange = document.createElement('div');
        riskChange.className = 'risk-level-change mb-4';
        
        // Determine the risk change color
        let riskChangeColor = 'text-muted';
        let riskChangeIcon = '';
        
        if (comparison.riskLevelChange.direction === 'increased') {
            riskChangeColor = 'text-danger';
            riskChangeIcon = '<i class="bi bi-arrow-up-circle-fill me-2"></i>';
        } else if (comparison.riskLevelChange.direction === 'decreased') {
            riskChangeColor = 'text-success';
            riskChangeIcon = '<i class="bi bi-arrow-down-circle-fill me-2"></i>';
        } else {
            riskChangeIcon = '<i class="bi bi-dash-circle-fill me-2"></i>';
        }
        
        riskChange.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h6>Risk Level Change</h6>
                    <p class="${riskChangeColor} fs-5 mb-0">
                        ${riskChangeIcon}
                        ${comparison.riskLevelChange.direction === 'unchanged' 
                            ? 'No change in risk level' 
                            : `Risk level ${comparison.riskLevelChange.direction} from ${comparison.riskLevelChange.before} to ${comparison.riskLevelChange.after}`}
                    </p>
                </div>
            </div>
        `;
        
        comparisonElement.appendChild(riskChange);
        
        // Vulnerability changes
        const vulnChanges = document.createElement('div');
        vulnChanges.className = 'vulnerability-changes mb-4';
        
        vulnChanges.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">Vulnerability Changes</h6>
                </div>
                <div class="card-body">
                    <div class="row text-center mb-3">
                        <div class="col-md-4">
                            <div class="p-3 ${comparison.vulnerabilityDiff.fixedCount > 0 ? 'bg-success-light' : 'bg-light'}">
                                <h3 class="${comparison.vulnerabilityDiff.fixedCount > 0 ? 'text-success' : 'text-muted'}">${comparison.vulnerabilityDiff.fixedCount}</h3>
                                <p class="mb-0">Fixed</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 ${comparison.vulnerabilityDiff.addedCount > 0 ? 'bg-danger-light' : 'bg-light'}">
                                <h3 class="${comparison.vulnerabilityDiff.addedCount > 0 ? 'text-danger' : 'text-muted'}">${comparison.vulnerabilityDiff.addedCount}</h3>
                                <p class="mb-0">New</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="p-3 ${comparison.vulnerabilityDiff.changedCount > 0 ? 'bg-warning-light' : 'bg-light'}">
                                <h3 class="${comparison.vulnerabilityDiff.changedCount > 0 ? 'text-warning' : 'text-muted'}">${comparison.vulnerabilityDiff.changedCount}</h3>
                                <p class="mb-0">Changed</p>
                            </div>
                        </div>
                    </div>
                    
                    <p class="total-count text-center">
                        Total vulnerabilities: 
                        <span class="${comparison.vulnerabilityDiff.totalBefore > comparison.vulnerabilityDiff.totalAfter ? 'text-success' : comparison.vulnerabilityDiff.totalBefore < comparison.vulnerabilityDiff.totalAfter ? 'text-danger' : 'text-muted'}">
                            ${comparison.vulnerabilityDiff.totalBefore} → ${comparison.vulnerabilityDiff.totalAfter}
                        </span>
                    </p>
                </div>
            </div>
        `;
        
        comparisonElement.appendChild(vulnChanges);
        
        // Fixed vulnerabilities list (if any)
        if (comparison.vulnerabilityDiff.fixedCount > 0) {
            const fixedList = document.createElement('div');
            fixedList.className = 'fixed-vulnerabilities mb-4';
            
            const fixedListContent = comparison.vulnerabilityDiff.fixed.map(vuln => `
                <li class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 text-success">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            ${escapeHTML(vuln.type)}
                        </h6>
                        <span class="badge ${getSeverityClass(vuln.severity)}">${vuln.severity}</span>
                    </div>
                    <p class="mb-1">${escapeHTML(vuln.description)}</p>
                    <small class="text-muted">${escapeHTML(vuln.location)}</small>
                </li>
            `).join('');
            
            fixedList.innerHTML = `
                <h6 class="text-success">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    Fixed Vulnerabilities
                </h6>
                <ul class="list-group">
                    ${fixedListContent}
                </ul>
            `;
            
            comparisonElement.appendChild(fixedList);
        }
        
        // New vulnerabilities list (if any)
        if (comparison.vulnerabilityDiff.addedCount > 0) {
            const newList = document.createElement('div');
            newList.className = 'new-vulnerabilities mb-4';
            
            const newListContent = comparison.vulnerabilityDiff.added.map(vuln => `
                <li class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 text-danger">
                            <i class="bi bi-exclamation-circle-fill me-2"></i>
                            ${escapeHTML(vuln.type)}
                        </h6>
                        <span class="badge ${getSeverityClass(vuln.severity)}">${vuln.severity}</span>
                    </div>
                    <p class="mb-1">${escapeHTML(vuln.description)}</p>
                    <small class="text-muted">${escapeHTML(vuln.location)}</small>
                </li>
            `).join('');
            
            newList.innerHTML = `
                <h6 class="text-danger">
                    <i class="bi bi-exclamation-circle-fill me-2"></i>
                    New Vulnerabilities
                </h6>
                <ul class="list-group">
                    ${newListContent}
                </ul>
            `;
            
            comparisonElement.appendChild(newList);
        }
        
        container.appendChild(comparisonElement);
    }
}

// Initialize and export database
const analysisDB = new AnalysisDatabase();

// Export the database and UI modules
window.AnalysisDB = {
    db: analysisDB,
    ui: ComparisonUI
};

// Helper function to get severity class from visualization.js
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

// Helper function to escape HTML from visualization.js
function escapeHTML(html) {
    const element = document.createElement('div');
    element.textContent = html;
    return element.innerHTML;
}
