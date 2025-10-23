import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Script from 'next/script'

export default function Home() {
    const [contractName, setContractName] = useState('')
    const [contractCode, setContractCode] = useState('')
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState('results')
    const editorRef = useRef<any>(null)

    useEffect(() => {
        // Initialize Monaco Editor when it's loaded
        if (typeof window !== 'undefined' && (window as any).monaco) {
            initializeMonacoEditor()
        }
    }, [])

    const initializeMonacoEditor = () => {
        const monaco = (window as any).monaco
        if (!monaco || editorRef.current) return

        const container = document.getElementById('monacoEditorContainer')
        if (!container) return

        editorRef.current = monaco.editor.create(container, {
            value: '',
            language: 'sol',
            theme: 'vs-dark',
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
        })

        editorRef.current.onDidChangeModelContent(() => {
            setContractCode(editorRef.current.getValue())
        })
    }

    const loadSampleContract = () => {
        const sampleCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableContract {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Vulnerable: external call before state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}`

        setContractName('VulnerableContract')
        setContractCode(sampleCode)
        if (editorRef.current) {
            editorRef.current.setValue(sampleCode)
        }
    }

    const analyzeContract = async () => {
        if (!contractName || !contractCode) {
            alert('Please enter contract name and code')
            return
        }

        setIsAnalyzing(true)
        try {
            const response = await fetch('/api/detection/analyze-contract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractName,
                    contractCode,
                }),
            })

            const data = await response.json()
            setAnalysisResult(data)
            setActiveTab('results')
        } catch (error) {
            console.error('Error analyzing contract:', error)
            alert('Error analyzing contract')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-300'
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-300'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    return (
        <>
            <Head>
                <title>Somnia Smart Contract Security Analyzer</title>
                <meta name="description" content="AI-powered smart contract security analyzer for Somnia network" />
            </Head>

            {/* Monaco Editor Configuration */}
            <Script
                id="monaco-config"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: `var require = { paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } };`,
                }}
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.main.nls.js"
                strategy="afterInteractive"
                onLoad={initializeMonacoEditor}
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/editor/editor.main.js"
                strategy="afterInteractive"
            />

            <div className="min-h-screen gradient-bg font-sans">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 nav-blur transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold gradient-text">Somnia Security</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-24 pb-20 overflow-hidden hero-pattern">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-40"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                Powered by Advanced AI Technology
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text mb-6">
                                Smart Contract
                                <br />
                                <span className="relative">
                                    Security Analyzer
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Detect hidden vulnerabilities and security risks in Somnia smart contracts with our AI-powered
                                analysis engine.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Main Analyzer Section */}
                <section id="analyzer" className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Smart Contract Analyzer</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Upload your Solidity code and get instant security analysis powered by advanced AI
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Contract Input Section */}
                            <div className="lg:col-span-8">
                                <div className="glass-hover rounded-2xl shadow-2xl p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">Smart Contract Code</h3>
                                        <button
                                            onClick={loadSampleContract}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Load Sample
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="contractName" className="block text-sm font-medium text-gray-700 mb-2">
                                                Contract Name
                                            </label>
                                            <input
                                                type="text"
                                                id="contractName"
                                                value={contractName}
                                                onChange={(e) => setContractName(e.target.value)}
                                                placeholder="MyToken"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Smart Contract Code
                                            </label>
                                            <div className="relative">
                                                <div
                                                    id="monacoEditorContainer"
                                                    className="border border-gray-300 rounded-xl overflow-hidden"
                                                    style={{ height: '500px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Panel */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass-hover rounded-2xl shadow-2xl p-6">
                                    <button
                                        onClick={analyzeContract}
                                        disabled={isAnalyzing}
                                        className="w-full btn-modern flex items-center justify-center space-x-3 text-lg py-4 disabled:opacity-50"
                                    >
                                        {isAnalyzing && (
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                        )}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                {analysisResult && (
                    <section className="py-16 bg-white/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="glass-hover rounded-2xl shadow-2xl">
                                <div className="border-b border-gray-200">
                                    <div className="px-6 py-4">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {analysisResult.error ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-red-800">{analysisResult.message}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Overall Risk */}
                                            <div
                                                className={`p-4 rounded-lg border ${getSeverityColor(
                                                    analysisResult.overallRisk
                                                )}`}
                                            >
                                                <h4 className="font-semibold mb-2">Overall Risk: {analysisResult.overallRisk}</h4>
                                                <p>{analysisResult.summary}</p>
                                            </div>

                                            {/* Vulnerabilities */}
                                            {analysisResult.vulnerabilities &&
                                                analysisResult.vulnerabilities.length > 0 && (
                                                    <div>
                                                        <h4 className="text-lg font-semibold mb-4">
                                                            Found {analysisResult.vulnerabilities.length} Vulnerabilities
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {analysisResult.vulnerabilities.map((vuln: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className="border border-gray-200 rounded-lg p-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-semibold">{vuln.type}</h5>
                                                                        <span
                                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                                                                                vuln.severity
                                                                            )}`}
                                                                        >
                                                                            {vuln.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-600 mb-2">{vuln.description}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Location: {vuln.location}
                                                                    </p>
                                                                    {vuln.recommendation && (
                                                                        <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                                                                            <p className="text-sm font-medium text-blue-900">
                                                                                Recommendation:
                                                                            </p>
                                                                            <p className="text-sm text-blue-800">
                                                                                {vuln.recommendation}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Recommendations */}
                                            {analysisResult.recommendations && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
                                                    {analysisResult.recommendations.immediate &&
                                                        analysisResult.recommendations.immediate.length > 0 && (
                                                            <div className="mb-4">
                                                                <h5 className="font-medium text-red-800 mb-2">
                                                                    Immediate Actions:
                                                                </h5>
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {analysisResult.recommendations.immediate.map(
                                                                        (rec: string, index: number) => (
                                                                            <li key={index} className="text-gray-700">
                                                                                {rec}
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    {analysisResult.recommendations.consideration &&
                                                        analysisResult.recommendations.consideration.length > 0 && (
                                                            <div>
                                                                <h5 className="font-medium text-blue-800 mb-2">
                                                                    Consider:
                                                                </h5>
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {analysisResult.recommendations.consideration.map(
                                                                        (rec: string, index: number) => (
                                                                            <li key={index} className="text-gray-700">
                                                                                {rec}
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12 mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold">Somnia Security</span>
                            </div>
                            <p className="text-gray-300 max-w-3xl mx-auto text-lg mb-8 leading-relaxed">
                                Advanced AI-powered smart contract security analysis for the Somnia blockchain ecosystem.
                            </p>
                            <div className="border-t border-gray-700 pt-6">
                                <p className="text-gray-400 text-sm">
                                    © 2025 Somnia Security. All rights reserved. Powered by Gemini AI.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
