/**
 * Monaco Editor Initialization for Somnia Smart Contract Analyzer
 * This file sets up the Monaco Editor with Solidity syntax highlighting
 */

// Global reference to the editor instance
let monacoEditor = null;
let currentTheme = 'vs-dark';

// Sample Solidity contract for demonstration
const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "SimpleToken";
    string public symbol = "STK";
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}`;

// Solidity language configuration for Monaco Editor
const solidityLanguageConfig = {
    keywords: [
        'pragma', 'solidity', 'contract', 'library', 'interface', 'using', 'struct', 'enum',
        'function', 'modifier', 'event', 'constructor', 'fallback', 'receive',
        'public', 'private', 'internal', 'external', 'pure', 'view', 'payable', 'virtual', 'override',
        'constant', 'immutable', 'anonymous', 'indexed',
        'if', 'else', 'while', 'for', 'do', 'break', 'continue', 'return', 'throw', 'emit',
        'try', 'catch', 'require', 'assert', 'revert',
        'new', 'delete', 'this', 'super',
        'import', 'from', 'as', 'is',
        'memory', 'storage', 'calldata',
        'mapping', 'address', 'string', 'bool',
        'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
        'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
        'byte', 'bytes', 'bytes1', 'bytes2', 'bytes4', 'bytes8', 'bytes16', 'bytes32',
        'abstract', 'after', 'case', 'default', 'final', 'in', 'inline', 'let', 'match',
        'null', 'of', 'relocatable', 'static', 'switch', 'typeof'
    ],
    operators: [
        '=', '>', '<', '!', '~', '?', ':',
        '==', '<=', '>=', '!=', '&&', '||', '++', '--',
        '+', '-', '*', '/', '&', '|', '^', '%', '<<',
        '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
        '^=', '%=', '<<=', '>>=', '>>>='
    ],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    tokenizer: {
        root: [
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier'
                }
            }],
            { include: '@whitespace' },
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@operators': 'operator',
                    '@default': ''
                }
            }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
            [/'[^\\']'/, 'string'],
            [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
            [/'/, 'string.invalid']
        ],
        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],
        comment: [
            [/[^\/*]+/, 'comment'],
            [/\/\*/, 'comment', '@push'],
            ["\\*/", 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],
    }
};

/**
 * Initialize Monaco Editor
 */
function initializeMonacoEditor() {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        // Register Solidity language
        monaco.languages.register({ id: 'solidity' });
        monaco.languages.setMonarchTokensProvider('solidity', solidityLanguageConfig);

        // Configure Solidity language features
        monaco.languages.setLanguageConfiguration('solidity', {
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"', notIn: ['string'] },
                { open: "'", close: "'", notIn: ['string', 'comment'] },
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
            ],
        });

        // Create the editor instance
        monacoEditor = monaco.editor.create(document.getElementById('monacoEditorContainer'), {
            value: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\n// Paste your Solidity smart contract code here\ncontract MyContract {\n    \n}',
            language: 'solidity',
            theme: currentTheme,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            minimap: {
                enabled: true
            },
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
            },
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordBasedSuggestions: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
        });

        // Sync Monaco Editor with hidden textarea for form submission
        monacoEditor.onDidChangeModelContent(() => {
            const code = monacoEditor.getValue();
            const textarea = document.getElementById('contractCode');
            if (textarea) {
                textarea.value = code;
            }
        });

        // Initial sync
        const textarea = document.getElementById('contractCode');
        if (textarea) {
            textarea.value = monacoEditor.getValue();
        }

        // Make editor globally accessible
        window.monacoEditor = monacoEditor;

        console.log('Monaco Editor initialized successfully');
    });
}

/**
 * Toggle between light and dark themes
 */
function toggleEditorTheme() {
    if (!monacoEditor) return;

    currentTheme = currentTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    monaco.editor.setTheme(currentTheme);

    // Update button appearance
    const themeBtn = document.getElementById('themeToggle');
    if (currentTheme === 'vs-dark') {
        themeBtn.innerHTML = `
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <span>Theme</span>
        `;
    } else {
        themeBtn.innerHTML = `
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span>Theme</span>
        `;
    }
}

/**
 * Load sample contract into editor
 */
function loadSampleContract() {
    if (monacoEditor) {
        monacoEditor.setValue(sampleContract);
        document.getElementById('contractName').value = 'SimpleToken';

        // Show a brief notification
        showNotification('Sample contract loaded!', 'success');
    }
}

/**
 * Get current editor value
 */
function getEditorValue() {
    return monacoEditor ? monacoEditor.getValue() : '';
}

/**
 * Set editor value
 */
function setEditorValue(value) {
    if (monacoEditor) {
        monacoEditor.setValue(value);
    }
}

/**
 * Show notification (simple implementation)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-y-0 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white font-medium`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(-10px)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize Monaco Editor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMonacoEditor);
} else {
    initializeMonacoEditor();
}

// Set up event listeners after initialization
window.addEventListener('load', function() {
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleEditorTheme);
    }

    // Fullscreen toggle button
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', toggleFullscreen);
    }

    // Sample contract buttons
    const sampleBtnTop = document.getElementById('sampleBtnTop');
    const sampleBtnBottom = document.getElementById('sampleBtnBottom');

    if (sampleBtnTop) {
        sampleBtnTop.addEventListener('click', loadSampleContract);
    }

    if (sampleBtnBottom) {
        sampleBtnBottom.addEventListener('click', loadSampleContract);
    }
});

/**
 * Fullscreen toggle functionality for Monaco Editor with Anime.js
 */
let isFullscreen = false;

function toggleFullscreen() {
    console.log('Fullscreen toggle clicked! Current state:', isFullscreen);

    const wrapper = document.getElementById('monacoEditorWrapper');
    const container = document.getElementById('monacoEditorContainer');
    const fullscreenBtn = document.getElementById('fullscreenToggle');
    const body = document.body;

    if (!wrapper || !fullscreenBtn || !container) {
        console.error('Could not find required elements');
        return;
    }

    if (!isFullscreen) {
        console.log('Entering fullscreen mode with anime.js...');

        // Store original dimensions
        const rect = container.getBoundingClientRect();

        // Add fullscreen class immediately for layout
        wrapper.classList.add('fullscreen');
        body.classList.add('fullscreen-active');
        isFullscreen = true;

        // Create backdrop element
        const backdrop = document.createElement('div');
        backdrop.id = 'fullscreen-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
            z-index: 9998;
            opacity: 0;
        `;
        document.body.appendChild(backdrop);

        // Animate backdrop
        anime({
            targets: backdrop,
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutCubic'
        });

        // Animate container
        anime({
            targets: container,
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .8)',
            begin: function() {
                container.style.transform = 'scale(0.9)';
                container.style.opacity = '0';
            },
            complete: function() {
                container.style.transform = '';
                container.style.opacity = '';
            }
        });

        // Animate button
        anime({
            targets: fullscreenBtn,
            scale: [1, 1.1, 1],
            rotate: [0, 360],
            duration: 500,
            easing: 'easeInOutQuad'
        });

        // Update button text with animation
        const span = fullscreenBtn.querySelector('span');
        if (span) {
            anime({
                targets: span,
                opacity: [1, 0],
                duration: 200,
                easing: 'easeOutQuad',
                complete: function() {
                    span.textContent = 'Exit';
                    anime({
                        targets: span,
                        opacity: [0, 1],
                        duration: 200,
                        easing: 'easeInQuad'
                    });
                }
            });
        }

        fullscreenBtn.classList.add('active');

        // Resize Monaco Editor
        setTimeout(() => {
            if (window.monacoEditor) {
                window.monacoEditor.layout();
                console.log('Monaco editor resized for fullscreen');
            }
        }, 600);

        // Add ESC key listener
        document.addEventListener('keydown', handleEscapeKey);

        // Show hint message
        showFullscreenHint();

        console.log('Fullscreen mode activated with anime.js!');
    } else {
        console.log('Exiting fullscreen mode...');

        const backdrop = document.getElementById('fullscreen-backdrop');

        // Animate exit
        anime({
            targets: container,
            scale: [1, 0.9],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInCubic'
        });

        if (backdrop) {
            anime({
                targets: backdrop,
                opacity: [1, 0],
                duration: 400,
                easing: 'easeInCubic',
                complete: function() {
                    backdrop.remove();
                }
            });
        }

        // Animate button back
        anime({
            targets: fullscreenBtn,
            scale: [1, 0.9, 1],
            rotate: [0, -360],
            duration: 400,
            easing: 'easeInOutQuad'
        });

        // Update button text
        const span = fullscreenBtn.querySelector('span');
        if (span) {
            anime({
                targets: span,
                opacity: [1, 0],
                duration: 150,
                easing: 'easeOutQuad',
                complete: function() {
                    span.textContent = 'Fullscreen';
                    anime({
                        targets: span,
                        opacity: [0, 1],
                        duration: 150,
                        easing: 'easeInQuad'
                    });
                }
            });
        }

        setTimeout(() => {
            wrapper.classList.remove('fullscreen');
            fullscreenBtn.classList.remove('active');
            body.classList.remove('fullscreen-active');
            isFullscreen = false;

            // Restore container styles
            container.style.transform = '';
            container.style.opacity = '';

            // Resize Monaco Editor
            if (window.monacoEditor) {
                window.monacoEditor.layout();
                console.log('Monaco editor resized back to normal');
            }

            // Remove ESC key listener
            document.removeEventListener('keydown', handleEscapeKey);

            // Remove hint
            const hint = document.getElementById('fullscreen-hint');
            if (hint) hint.remove();

            console.log('Fullscreen mode deactivated!');
        }, 400);
    }
}

/**
 * Show fullscreen hint with anime.js animation
 */
function showFullscreenHint() {
    const hint = document.createElement('div');
    hint.id = 'fullscreen-hint';
    hint.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(50px);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        backdrop-filter: blur(10px);
        z-index: 10001;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        opacity: 0;
    `;
    hint.textContent = 'Press ESC or click Exit to close';
    document.body.appendChild(hint);

    anime({
        targets: hint,
        translateX: '-50%',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 300,
        easing: 'easeOutElastic(1, .6)'
    });
}

/**
 * Handle ESC key to exit fullscreen
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
    }
}

// Export functions for use in other scripts
window.getEditorValue = getEditorValue;
window.setEditorValue = setEditorValue;
window.loadSampleContract = loadSampleContract;
window.toggleFullscreen = toggleFullscreen;
