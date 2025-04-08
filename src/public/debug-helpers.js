// Debug helpers for deployed environment

// Log API request paths to help debug routing issues
function logApiRequest(url, method) {
    console.log(`Making ${method} request to: ${url}`);
    
    // Create a visible debug element if in debug mode
    if (localStorage.getItem('DEBUG_MODE') === 'true') {
        const debugInfo = document.createElement('div');
        debugInfo.className = 'debug-info alert alert-info';
        debugInfo.innerHTML = `
            <h5>API Debug Info:</h5>
            <p><strong>Request:</strong> ${method} ${url}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <button class="btn btn-sm btn-secondary" onclick="this.parentNode.remove()">Dismiss</button>
        `;
        
        // Add to page
        const debugContainer = document.querySelector('#debug-container') || document.body;
        debugContainer.appendChild(debugInfo);
    }
    
    return url;
}

// Enable debug mode with ?debug=true in URL
function initDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        localStorage.setItem('DEBUG_MODE', 'true');
        console.log('Debug mode enabled');
        
        // Add debug container
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.style.position = 'fixed';
        debugContainer.style.bottom = '10px';
        debugContainer.style.right = '10px';
        debugContainer.style.width = '300px';
        debugContainer.style.zIndex = '9999';
        document.body.appendChild(debugContainer);
        
        // Add debug notice
        const debugNotice = document.createElement('div');
        debugNotice.className = 'alert alert-warning';
        debugNotice.innerHTML = `
            <strong>Debug Mode Enabled</strong>
            <p>API requests will be logged here</p>
            <button class="btn btn-sm btn-danger" onclick="localStorage.removeItem('DEBUG_MODE'); location.href=location.pathname;">Disable Debug Mode</button>
        `;
        debugContainer.appendChild(debugNotice);
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', initDebugMode);

// Export helpers
window.debugHelpers = {
    logApiRequest,
    initDebugMode
};
