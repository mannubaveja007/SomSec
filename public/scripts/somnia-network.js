/**
 * Somnia Network Information and Utilities
 * Provides network-specific information and helper functions
 */

// Somnia Network Configuration
const SOMNIA_NETWORK = {
    MAINNET: {
        chainId: 5031,
        name: 'Somnia Mainnet',
        rpcUrl: 'https://api.infra.mainnet.somnia.network/',
        explorerUrl: 'https://explorer.somnia.network',
        symbol: 'SOMI',
        multicall: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11',
        entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
        factory: '0x4be0ddfebca9a5a4a617dee4dece99e7c862dceb',
        faucet: 'https://stakely.io/faucet/somnia-somi'
    },
    TESTNET: {
        chainId: 50312,
        name: 'Somnia Testnet',
        rpcUrl: 'https://dream-rpc.somnia.network/',
        explorerUrl: 'https://shannon-explorer.somnia.network/',
        symbol: 'STT',
        multicall: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223',
        entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
        factory: '0x4be0ddfebca9a5a4a617dee4dece99e7c862dceb',
        faucet: 'https://testnet.somnia.network/',
        alternativeExplorer: 'https://somnia-testnet.socialscan.io/'
    }
};

// Current network (default to testnet)
let currentNetwork = SOMNIA_NETWORK.TESTNET;

/**
 * Get current network configuration
 */
function getCurrentNetwork() {
    return currentNetwork;
}

/**
 * Switch network (for future multi-network support)
 */
function switchNetwork(networkType) {
    if (networkType === 'mainnet') {
        currentNetwork = SOMNIA_NETWORK.MAINNET;
    } else {
        currentNetwork = SOMNIA_NETWORK.TESTNET;
    }
    updateNetworkUI();
}

/**
 * Update UI elements with current network information
 */
function updateNetworkUI() {
    const networkBadge = document.getElementById('network-badge');
    const networkInfo = document.getElementById('network-info');

    if (networkBadge) {
        networkBadge.textContent = currentNetwork.name;
        networkBadge.className = `badge bg-${currentNetwork === SOMNIA_NETWORK.MAINNET ? 'success' : 'primary'} network-badge`;
    }

    if (networkInfo) {
        networkInfo.innerHTML = `
            <div class="network-details">
                <small class="text-muted">Network: ${currentNetwork.name}</small><br>
                <small class="text-muted">Chain ID: ${currentNetwork.chainId}</small><br>
                <small class="text-muted">Symbol: ${currentNetwork.symbol}</small>
            </div>
        `;
    }
}

/**
 * Get explorer URL for a transaction or address
 */
function getExplorerUrl(hashOrAddress, type = 'tx') {
    const baseUrl = currentNetwork.explorerUrl;
    if (type === 'address') {
        return `${baseUrl}/address/${hashOrAddress}`;
    }
    return `${baseUrl}/tx/${hashOrAddress}`;
}

/**
 * Get faucet URL for current network
 */
function getFaucetUrl() {
    return currentNetwork.faucet;
}

/**
 * Initialize network UI when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add network information to header if container exists
    const headerContainer = document.querySelector('header .row');
    if (headerContainer) {
        const networkSection = document.createElement('div');
        networkSection.className = 'col-12 mt-2';
        networkSection.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <span id="network-badge" class="badge bg-primary network-badge">${currentNetwork.name}</span>
                    <div id="network-info">
                        <small class="text-muted">Chain ID: ${currentNetwork.chainId} | Symbol: ${currentNetwork.symbol}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <a href="${currentNetwork.explorerUrl}" target="_blank" class="btn btn-sm btn-outline-secondary" title="View Block Explorer">
                        <i class="bi bi-box-arrow-up-right"></i> Explorer
                    </a>
                    <a href="${currentNetwork.faucet}" target="_blank" class="btn btn-sm btn-outline-primary" title="Get Test Tokens">
                        <i class="bi bi-droplet"></i> Faucet
                    </a>
                </div>
            </div>
        `;
        headerContainer.appendChild(networkSection);
    }

    updateNetworkUI();
});

// Export for use in other modules
window.SOMNIA_NETWORK = SOMNIA_NETWORK;
window.getCurrentNetwork = getCurrentNetwork;
window.switchNetwork = switchNetwork;
window.getExplorerUrl = getExplorerUrl;
window.getFaucetUrl = getFaucetUrl;