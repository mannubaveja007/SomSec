/**
 * Smart Contract Security Educational Module
 * Provides educational content and interactive learning for smart contract security
 */

// Educational content configuration
const educationalContent = {
    vulnerabilityCategories: {
        'REENTRANCY': {
            title: 'Reentrancy Attacks',
            description: 'Reentrancy occurs when external contract calls are allowed to make new calls back to the calling contract before the initial execution is complete.',
            examples: [
                {
                    name: 'The DAO Hack',
                    description: 'The infamous hack that led to the Ethereum hard fork, exploiting a reentrancy vulnerability to drain ~3.6M ETH.',
                    code: `function withdrawBalance() {
    uint amountToWithdraw = userBalances[msg.sender];
    // This sends the money to the caller
    if (!(msg.sender.call.value(amountToWithdraw)())) { throw; }
    // Only after the money is sent, the balance is set to 0
    userBalances[msg.sender] = 0;
}`
                }
            ],
            bestPractices: [
                'Follow the Checks-Effects-Interactions pattern',
                'Use ReentrancyGuard or nonReentrant modifiers',
                'Update state before making external calls',
                'Consider using pull payment patterns instead of push'
            ],
            learnMore: 'https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/'
        },
        'ACCESS_CONTROL': {
            title: 'Access Control Vulnerabilities',
            description: 'Access control vulnerabilities occur when contracts fail to properly restrict access to privileged functions or lack proper authorization checks.',
            examples: [
                {
                    name: 'Parity Multi-Sig Wallet',
                    description: 'The Parity Multi-Sig wallet hack where an unprotected initialization function allowed an attacker to take ownership and eventually freeze millions in ETH.',
                    code: `// The initWallet function had no access control
function initWallet(address[] _owners, uint _required, uint _daylimit) {
    initDaylimit(_daylimit);
    initMultiowned(_owners, _required);
}`
                }
            ],
            bestPractices: [
                'Use OpenZeppelin\'s AccessControl or Ownable contracts',
                'Implement role-based access control for complex systems',
                'Use two-step ownership transfers',
                'Add proper modifier checks to all sensitive functions',
                'Make initialization functions callable only once'
            ],
            learnMore: 'https://consensys.github.io/smart-contract-best-practices/development-recommendations/general/access-control/'
        },
        'ARITHMETIC': {
            title: 'Arithmetic Vulnerabilities',
            description: 'Arithmetic vulnerabilities include integer overflow/underflow, precision loss, and other mathematical issues that can lead to unexpected behavior.',
            examples: [
                {
                    name: 'Integer Overflow in BEC Token',
                    description: 'BeautyChain (BEC) token had an overflow vulnerability that allowed creation of tokens beyond the maximum supply.',
                    code: `function batchTransfer(address[] _receivers, uint256 _value) public {
    uint cnt = _receivers.length;
    uint256 amount = uint256(cnt) * _value; // Overflow happens here
    // ...
}`
                }
            ],
            bestPractices: [
                'Use SafeMath libraries for Solidity < 0.8.0',
                'Solidity 0.8.0+ includes overflow/underflow protection by default',
                'Consider precision issues in division operations',
                'Be aware of rounding errors in financial calculations',
                'Consider using fixed-point arithmetic for precise calculations'
            ],
            learnMore: 'https://consensys.github.io/smart-contract-best-practices/attacks/overflow-underflow/'
        },
        'TRANSACTION_ORDERING': {
            title: 'Transaction Ordering Vulnerabilities',
            description: 'Transaction ordering vulnerabilities include front-running, where miners or other users can manipulate transaction order for profit.',
            examples: [
                {
                    name: 'DEX Front-Running',
                    description: 'Front-running attacks on decentralized exchanges where someone can see a profitable trade in the mempool and execute their own trade first.',
                    code: `// Vulnerable function without deadline protection
function swap(uint amountIn, uint amountOutMin, address[] path) {
    // No deadline parameter, can be front-run
    // ...
}`
                }
            ],
            bestPractices: [
                'Use commit-reveal schemes for sensitive operations',
                'Implement transaction deadlines to limit the time a transaction is valid',
                'Add minimum/maximum acceptable price parameters',
                'Consider using batch auctions instead of continuous markets',
                'Use private mempools or flashbots for critical transactions'
            ],
            learnMore: 'https://consensys.github.io/smart-contract-best-practices/attacks/frontrunning/'
        },
        'ORACLE': {
            title: 'Oracle and Price Manipulation',
            description: 'Oracle vulnerabilities occur when smart contracts rely on external data sources that can be manipulated or provide stale/incorrect data.',
            examples: [
                {
                    name: 'Synthetix sKRW Manipulation',
                    description: 'An oracle manipulation that allowed an attacker to profit by manipulating the Korean Won exchange rate.',
                    code: `// Vulnerable price feed without aggregation
function getLatestPrice() public view returns (uint) {
    return singleOracleSource.getPrice(); // Single point of failure
}`
                }
            ],
            bestPractices: [
                'Use decentralized oracle networks like Chainlink',
                'Implement price deviation checks',
                'Use time-weighted average prices (TWAP) instead of spot prices',
                'Implement circuit breakers for extreme price movements',
                'Consider using multiple independent oracle sources'
            ],
            learnMore: 'https://consensys.github.io/smart-contract-best-practices/development-recommendations/oracle-integration/'
        }
    },
    securityChecklists: [
        {
            name: 'Basic Security Checklist',
            items: [
                'Use specific compiler pragma (avoid ^)',
                'Mark functions as external when possible',
                'Use modifiers for access control',
                'Protect against reentrancy attacks',
                'Check for arithmetic vulnerabilities',
                'Validate all inputs',
                'Handle errors properly',
                'Use events for important state changes',
                'Test thoroughly with unit and integration tests',
                'Get an external audit'
            ]
        },
        {
            name: 'Advanced Security Checklist',
            items: [
                'Conduct formal verification',
                'Implement circuit breakers for emergency stops',
                'Use upgradable patterns correctly',
                'Add timelock mechanisms for sensitive operations',
                'Implement multi-signature schemes for high-value operations',
                'Conduct gas optimization without sacrificing security',
                'Protect against flash loan attacks',
                'Add slippage protection for DEXes',
                'Implement proper access control with role-based systems',
                'Conduct economic attack simulations'
            ]
        }
    ],
    interactiveExercises: [
        {
            id: 'reentrancy-exercise',
            title: 'Spot the Reentrancy Vulnerability',
            description: 'Can you identify and fix the reentrancy vulnerability in this code?',
            code: `contract VulnerableBank {
    mapping(address => uint) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= _amount;
    }
}`,
            hint: 'Look at the order of operations in the withdraw function.',
            solution: `contract FixedBank {
    mapping(address => uint) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        
        // Update state before external call
        balances[msg.sender] -= _amount;
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
    }
}`
        },
        {
            id: 'access-control-exercise',
            title: 'Fix the Access Control Issue',
            description: 'This contract has an access control vulnerability. Can you fix it?',
            code: `contract VulnerableToken {
    mapping(address => uint) public balances;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function mint(address _to, uint _amount) public {
        // Missing access control
        balances[_to] += _amount;
    }
    
    function transfer(address _to, uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}`,
            hint: 'The mint function should only be callable by the owner.',
            solution: `contract FixedToken {
    mapping(address => uint) public balances;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Add access control modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Apply the modifier
    function mint(address _to, uint _amount) public onlyOwner {
        balances[_to] += _amount;
    }
    
    function transfer(address _to, uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}`
        }
    ],
    securityResources: [
        {
            name: 'Consensys Smart Contract Best Practices',
            url: 'https://consensys.github.io/smart-contract-best-practices/',
            description: 'Comprehensive guide to smart contract security best practices'
        },
        {
            name: 'OpenZeppelin Security Blog',
            url: 'https://blog.openzeppelin.com/security-audits/',
            description: 'Security insights from the OpenZeppelin team'
        },
        {
            name: 'SWC Registry',
            url: 'https://swcregistry.io/',
            description: 'Smart Contract Weakness Classification and Test Cases'
        },
        {
            name: 'Ethereum Smart Contract Security Best Practices',
            url: 'https://ethereum.org/en/developers/docs/smart-contracts/security/',
            description: 'Official Ethereum documentation on smart contract security'
        },
        {
            name: 'Trail of Bits Blog',
            url: 'https://blog.trailofbits.com/',
            description: 'Security research and analysis from Trail of Bits'
        }
    ]
};

/**
 * Educational Module UI Class
 * Handles rendering educational content
 */
class EducationalUI {
    /**
     * Render a vulnerability category guide
     * @param {string} categoryKey - The category key to render
     * @param {HTMLElement} container - The container to render in
     */
    static renderVulnerabilityGuide(categoryKey, container) {
        if (!container) return;
        
        const category = educationalContent.vulnerabilityCategories[categoryKey];
        if (!category) {
            container.innerHTML = '<div class="alert alert-warning">Category not found</div>';
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create guide element
        const guideElement = document.createElement('div');
        guideElement.className = 'vulnerability-guide';
        
        // Title and description
        const header = document.createElement('div');
        header.className = 'guide-header mb-4';
        header.innerHTML = `
            <h4>${category.title}</h4>
            <p class="lead">${category.description}</p>
            <a href="${category.learnMore}" target="_blank" class="btn btn-primary btn-sm">
                <i class="bi bi-book me-2"></i> Learn More
            </a>
        `;
        guideElement.appendChild(header);
        
        // Best practices
        const practices = document.createElement('div');
        practices.className = 'best-practices mb-4';
        practices.innerHTML = `
            <h5><i class="bi bi-shield-check me-2"></i>Best Practices</h5>
            <ul class="list-group">
                ${category.bestPractices.map(practice => `
                    <li class="list-group-item">
                        <i class="bi bi-check-circle-fill me-2 text-success"></i>
                        ${practice}
                    </li>
                `).join('')}
            </ul>
        `;
        guideElement.appendChild(practices);
        
        // Examples
        const examples = document.createElement('div');
        examples.className = 'vulnerability-examples mb-4';
        examples.innerHTML = `
            <h5><i class="bi bi-exclamation-triangle-fill me-2"></i>Real-World Examples</h5>
            <div class="accordion" id="examplesAccordion">
                ${category.examples.map((example, index) => `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="example-heading-${index}">
                            <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#example-collapse-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="example-collapse-${index}">
                                ${example.name}
                            </button>
                        </h2>
                        <div id="example-collapse-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="example-heading-${index}" data-bs-parent="#examplesAccordion">
                            <div class="accordion-body">
                                <p>${example.description}</p>
                                <pre class="language-solidity"><code class="language-solidity">${this.escapeHTML(example.code)}</code></pre>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        guideElement.appendChild(examples);
        
        container.appendChild(guideElement);
        
        // Highlight code with Prism.js if available
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }
    }
    
    /**
     * Render security checklists
     * @param {HTMLElement} container - The container to render in
     */
    static renderSecurityChecklists(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create checklist element
        const checklistElement = document.createElement('div');
        checklistElement.className = 'security-checklists';
        
        // Add each checklist
        educationalContent.securityChecklists.forEach((checklist, index) => {
            const checklistCard = document.createElement('div');
            checklistCard.className = 'card mb-4';
            
            checklistCard.innerHTML = `
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">${checklist.name}</h5>
                </div>
                <div class="card-body">
                    <div class="checklist-items">
                        ${checklist.items.map((item, itemIndex) => `
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="checklist-${index}-item-${itemIndex}">
                                <label class="form-check-label" for="checklist-${index}-item-${itemIndex}">
                                    ${item}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3 text-end">
                        <button class="btn btn-outline-primary btn-sm reset-checklist">Reset</button>
                        <button class="btn btn-primary btn-sm check-all">Check All</button>
                    </div>
                </div>
            `;
            
            checklistElement.appendChild(checklistCard);
        });
        
        container.appendChild(checklistElement);
        
        // Add event listeners to checklist buttons
        const resetButtons = container.querySelectorAll('.reset-checklist');
        resetButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const checkboxes = card.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = false);
            });
        });
        
        const checkAllButtons = container.querySelectorAll('.check-all');
        checkAllButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const checkboxes = card.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => checkbox.checked = true);
            });
        });
    }
    
    /**
     * Render interactive exercises
     * @param {HTMLElement} container - The container to render in
     */
    static renderInteractiveExercises(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create exercises element
        const exercisesElement = document.createElement('div');
        exercisesElement.className = 'interactive-exercises';
        
        // Create tabs for exercises
        const tabsNav = document.createElement('ul');
        tabsNav.className = 'nav nav-tabs mb-3';
        tabsNav.id = 'exercisesTabs';
        tabsNav.innerHTML = educationalContent.interactiveExercises.map((exercise, index) => `
            <li class="nav-item">
                <a class="nav-link ${index === 0 ? 'active' : ''}" 
                   id="tab-${exercise.id}" 
                   data-bs-toggle="tab" 
                   href="#content-${exercise.id}" 
                   role="tab"
                   aria-controls="content-${exercise.id}"
                   aria-selected="${index === 0 ? 'true' : 'false'}">
                    ${exercise.title}
                </a>
            </li>
        `).join('');
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = 'exercisesTabContent';
        
        educationalContent.interactiveExercises.forEach((exercise, index) => {
            const pane = document.createElement('div');
            pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
            pane.id = `content-${exercise.id}`;
            pane.setAttribute('role', 'tabpanel');
            pane.setAttribute('aria-labelledby', `tab-${exercise.id}`);
            
            pane.innerHTML = `
                <div class="exercise-content">
                    <p class="lead">${exercise.description}</p>
                    
                    <div class="card mb-3">
                        <div class="card-header">
                            <h5 class="mb-0">Vulnerable Code</h5>
                        </div>
                        <div class="card-body">
                            <pre class="language-solidity"><code class="language-solidity">${this.escapeHTML(exercise.code)}</code></pre>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <button class="btn btn-warning btn-sm show-hint" data-exercise="${exercise.id}">
                            <i class="bi bi-lightbulb me-2"></i> Show Hint
                        </button>
                        <button class="btn btn-success btn-sm show-solution" data-exercise="${exercise.id}">
                            <i class="bi bi-check-circle me-2"></i> Show Solution
                        </button>
                    </div>
                    
                    <div class="hint-box alert alert-warning d-none" id="hint-${exercise.id}">
                        <h6><i class="bi bi-lightbulb-fill me-2"></i>Hint:</h6>
                        <p>${exercise.hint}</p>
                    </div>
                    
                    <div class="solution-box d-none" id="solution-${exercise.id}">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0">Solution</h5>
                            </div>
                            <div class="card-body">
                                <pre class="language-solidity"><code class="language-solidity">${this.escapeHTML(exercise.solution)}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            tabContent.appendChild(pane);
        });
        
        exercisesElement.appendChild(tabsNav);
        exercisesElement.appendChild(tabContent);
        container.appendChild(exercisesElement);
        
        // Add event listeners for hint and solution buttons
        const hintButtons = container.querySelectorAll('.show-hint');
        hintButtons.forEach(button => {
            button.addEventListener('click', function() {
                const exerciseId = this.getAttribute('data-exercise');
                const hintBox = document.getElementById(`hint-${exerciseId}`);
                hintBox.classList.toggle('d-none');
            });
        });
        
        const solutionButtons = container.querySelectorAll('.show-solution');
        solutionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const exerciseId = this.getAttribute('data-exercise');
                const solutionBox = document.getElementById(`solution-${exerciseId}`);
                solutionBox.classList.toggle('d-none');
                
                // Highlight code when solution is shown
                if (!solutionBox.classList.contains('d-none') && window.Prism) {
                    Prism.highlightAllUnder(solutionBox);
                }
            });
        });
        
        // Highlight code with Prism.js if available
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }
    }
    
    /**
     * Render security resources
     * @param {HTMLElement} container - The container to render in
     */
    static renderSecurityResources(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create resources element
        const resourcesElement = document.createElement('div');
        resourcesElement.className = 'security-resources';
        
        // Create resource list
        const resourceList = document.createElement('div');
        resourceList.className = 'resource-list card-group row-cols-1 row-cols-md-3 g-4';
        
        resourceList.innerHTML = educationalContent.securityResources.map(resource => `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${resource.name}</h5>
                        <p class="card-text">${resource.description}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <a href="${resource.url}" target="_blank" class="btn btn-primary w-100">
                            <i class="bi bi-box-arrow-up-right me-2"></i> Visit Resource
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
        
        resourcesElement.appendChild(resourceList);
        container.appendChild(resourcesElement);
    }
    
    /**
     * Render educational dashboard with all components
     * @param {HTMLElement} container - The container to render in
     */
    static renderEducationalDashboard(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create dashboard layout
        container.innerHTML = `
            <div class="educational-dashboard">
                <h3 class="mb-4">Smart Contract Security Education</h3>
                
                <ul class="nav nav-tabs mb-4" id="educationTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="vulnerabilities-tab" data-bs-toggle="tab" data-bs-target="#vulnerabilities" type="button" role="tab" aria-controls="vulnerabilities" aria-selected="true">
                            <i class="bi bi-shield-exclamation me-2"></i> Vulnerability Guides
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="checklists-tab" data-bs-toggle="tab" data-bs-target="#checklists" type="button" role="tab" aria-controls="checklists" aria-selected="false">
                            <i class="bi bi-check-square me-2"></i> Security Checklists
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="exercises-tab" data-bs-toggle="tab" data-bs-target="#exercises" type="button" role="tab" aria-controls="exercises" aria-selected="false">
                            <i class="bi bi-code-square me-2"></i> Interactive Exercises
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="resources-tab" data-bs-toggle="tab" data-bs-target="#resources" type="button" role="tab" aria-controls="resources" aria-selected="false">
                            <i class="bi bi-journal-text me-2"></i> Learning Resources
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content" id="educationTabContent">
                    <div class="tab-pane fade show active" id="vulnerabilities" role="tabpanel" aria-labelledby="vulnerabilities-tab">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="list-group vulnerability-category-list mb-4">
                                    ${Object.entries(educationalContent.vulnerabilityCategories).map(([key, category], index) => `
                                        <a href="#" class="list-group-item list-group-item-action ${index === 0 ? 'active' : ''}" data-category="${key}">
                                            ${category.title}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="col-md-9">
                                <div class="vulnerability-guide-container"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="checklists" role="tabpanel" aria-labelledby="checklists-tab">
                        <div class="security-checklists-container"></div>
                    </div>
                    
                    <div class="tab-pane fade" id="exercises" role="tabpanel" aria-labelledby="exercises-tab">
                        <div class="interactive-exercises-container"></div>
                    </div>
                    
                    <div class="tab-pane fade" id="resources" role="tabpanel" aria-labelledby="resources-tab">
                        <div class="security-resources-container"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize content for first tab
        this.renderVulnerabilityGuide(
            Object.keys(educationalContent.vulnerabilityCategories)[0],
            container.querySelector('.vulnerability-guide-container')
        );
        
        // Add event listeners to category list
        const categoryLinks = container.querySelectorAll('.vulnerability-category-list a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active state
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Render the selected category
                const categoryKey = this.getAttribute('data-category');
                EducationalUI.renderVulnerabilityGuide(
                    categoryKey,
                    container.querySelector('.vulnerability-guide-container')
                );
            });
        });
        
        // Initialize content for other tabs when they're shown
        const tabEls = container.querySelectorAll('button[data-bs-toggle="tab"]');
        tabEls.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(e) {
                const targetId = e.target.getAttribute('data-bs-target');
                
                if (targetId === '#checklists') {
                    EducationalUI.renderSecurityChecklists(
                        container.querySelector('.security-checklists-container')
                    );
                } else if (targetId === '#exercises') {
                    EducationalUI.renderInteractiveExercises(
                        container.querySelector('.interactive-exercises-container')
                    );
                } else if (targetId === '#resources') {
                    EducationalUI.renderSecurityResources(
                        container.querySelector('.security-resources-container')
                    );
                }
            });
        });
    }
    
    /**
     * Helper method to escape HTML
     * @param {string} html - The HTML to escape
     * @returns {string} The escaped HTML
     */
    static escapeHTML(html) {
        const element = document.createElement('div');
        element.textContent = html;
        return element.innerHTML;
    }
}

// Export the educational module
window.SmartContractEducation = {
    content: educationalContent,
    ui: EducationalUI
};
