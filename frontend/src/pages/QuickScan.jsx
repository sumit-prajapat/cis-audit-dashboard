import { useState, useEffect } from 'react';
import { Download, Play, CheckCircle, AlertCircle, Shield, Info, Copy, X } from 'lucide-react';

export default function QuickScan() {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://cis-audit-api.onrender.com';

  // Force modal to show when token changes
  useEffect(() => {
    if (token && token.length > 0) {
      setShowTokenModal(true);
      setShowToken(true);
    }
  }, [token]);

  const handleDownloadLauncher = (platform) => {
    // Get access token from localStorage
    const userToken = localStorage.getItem('access_token');
    
    if (!userToken) {
      setDownloadStatus('❌ Error: Not authenticated. Please login first.');
      return;
    }
    
    setDownloadStatus(`⬇️ Downloading ${platform} launcher...`);
    
    // Create download with embedded token
    const downloadUrl = `${API_URL}/downloads/cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}?token=${userToken}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // IMMEDIATELY show token - no delays
    setToken(userToken);
    setShowToken(true);
    setShowTokenModal(true);
    setDownloadStatus(`✅ ${platform.toUpperCase()} launcher downloaded!`);
    
    // Copy to clipboard
    navigator.clipboard.writeText(userToken).then(() => {
      console.log('✅ Token copied to clipboard');
    }).catch(err => {
      console.error('❌ Failed to copy:', err);
    });
    
    // Clear download status after 10 seconds
    setTimeout(() => setDownloadStatus(null), 10000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: select text
      alert('Token: ' + token);
    });
  };

  const closeModal = () => {
    setShowTokenModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-emerald-400" />
            Quick Scan v2.2.0
          </h1>
          <p className="text-slate-400 text-lg">
            Download and run the CIS scanner on any computer in seconds
          </p>
        </div>

        {/* Status Banner */}
        {downloadStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            downloadStatus.includes('Error') 
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          }`}>
            {downloadStatus.includes('Error') ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{downloadStatus}</span>
          </div>
        )}

        {/* Token Display (shows after download) */}
        {showToken && token && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  Your Authentication Token
                </h3>
                <p className="text-slate-300 text-sm mt-1">Copy this token to run the scanner</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  Show Instructions
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Token
                </button>
              </div>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-4">
              <code className="text-cyan-400 text-sm font-mono break-all block">
                {token}
              </code>
            </div>
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">💡 How to use:</p>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <p>1. Open Command Prompt as Administrator</p>
                <p>2. cd Downloads</p>
                <p className="text-cyan-400">3. set CIS_TOKEN=YOUR_TOKEN_ABOVE</p>
                <p>4. cis-scanner-windows.exe</p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-400 font-bold text-lg">1</span>
              </div>
              <h3 className="text-white font-medium mb-1">Download</h3>
              <p className="text-slate-400 text-sm">Get the launcher for your OS</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan-400 font-bold text-lg">2</span>
              </div>
              <h3 className="text-white font-medium mb-1">Run</h3>
              <p className="text-slate-400 text-sm">Double-click the file</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold text-lg">3</span>
              </div>
              <h3 className="text-white font-medium mb-1">Scan</h3>
              <p className="text-slate-400 text-sm">Checks run automatically</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-400 font-bold text-lg">4</span>
              </div>
              <h3 className="text-white font-medium mb-1">View</h3>
              <p className="text-slate-400 text-sm">Results appear here</p>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Windows Launcher */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 88 88">
                  <path d="M0,12.402,35.687,7.586V42.37H0Zm35.687,33.529V80.915L0,75.999V45.931ZM40.072,7.177,87.314,0V42.37H40.072ZM87.314,45.931V87.299L40.072,80.915V45.931Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Windows</h3>
                <p className="text-slate-400 text-sm">Windows 10, 11, Server</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">
              One-click scanner for Windows systems. Checks password policies, firewall, Windows Defender, and more.
            </p>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                18+ security checks
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                No installation required
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Auto-authenticated
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ~1.5 MB download
              </li>
            </ul>

            <button
              onClick={() => handleDownloadLauncher('windows')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Windows Launcher
            </button>
          </div>

          {/* Linux Launcher */}
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-8 hover:border-orange-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.308 1.51-.308 2.14 0 3.908 3.205 7.177 7.076 7.177 3.839 0 6.942-3.14 6.942-7.177 0-2.031-.771-3.867-2.033-5.251-1.194-1.315-2.463-2.064-2.463-4.542C14.302 2.771 13.434 0 12.504 0zm-.005 4.21c.176 0 .319.143.319.319 0 .176-.143.319-.319.319-.176 0-.319-.143-.319-.319 0-.176.143-.319.319-.319z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Linux</h3>
                <p className="text-slate-400 text-sm">Ubuntu, Debian, CentOS, RHEL</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6">
              Portable scanner for Linux servers. Checks SSH config, firewall, password policies, and system hardening.
            </p>
            
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                19+ security checks
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Portable executable
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Requires sudo privileges
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ~2 MB download
              </li>
            </ul>

            <button
              onClick={() => handleDownloadLauncher('linux')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Linux Launcher
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Windows Instructions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Windows Usage</h3>
            <ol className="space-y-3 text-slate-300 text-sm">
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">1.</span>
                <div>
                  <p className="font-medium text-white">Download & Save</p>
                  <p className="text-slate-400">Save <code className="text-cyan-400">cis-scanner-windows.exe</code> to Downloads</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">2.</span>
                <div>
                  <p className="font-medium text-white">Open Command Prompt as Administrator</p>
                  <p className="text-slate-400">Press Win+X, select "Terminal (Admin)" or "Command Prompt (Admin)"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">3.</span>
                <div>
                  <p className="font-medium text-white">Run with Token</p>
                  <p className="text-slate-400 font-mono text-xs bg-slate-900 p-2 rounded mt-1">
                    cd Downloads<br/>
                    set CIS_TOKEN={localStorage.getItem('access_token') || 'YOUR_TOKEN'}<br/>
                    cis-scanner-windows.exe
                  </p>
                  <p className="text-yellow-400 text-xs mt-2">💡 Copy your token from above when you download</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">4.</span>
                <div>
                  <p className="font-medium text-white">Wait for Scan</p>
                  <p className="text-slate-400">Takes 30-60 seconds to complete</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">5.</span>
                <div>
                  <p className="font-medium text-white">View Results</p>
                  <p className="text-slate-400">Refresh this page to see results</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Linux Instructions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Linux Usage</h3>
            <ol className="space-y-3 text-slate-300 text-sm">
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">1.</span>
                <div>
                  <p className="font-medium text-white">Download File</p>
                  <p className="text-slate-400">Save <code className="text-cyan-400">cis-scanner-linux</code> to ~/Downloads</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">2.</span>
                <div>
                  <p className="font-medium text-white">Make Executable</p>
                  <p className="text-slate-400 font-mono text-xs">chmod +x ~/Downloads/cis-scanner-linux</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">3.</span>
                <div>
                  <p className="font-medium text-white">Run with Sudo</p>
                  <p className="text-slate-400 font-mono text-xs">sudo ~/Downloads/cis-scanner-linux</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">4.</span>
                <div>
                  <p className="font-medium text-white">Wait for Scan</p>
                  <p className="text-slate-400">Takes 30-60 seconds to complete</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">5.</span>
                <div>
                  <p className="font-medium text-white">Check Dashboard</p>
                  <p className="text-slate-400">Refresh this page to see results</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Troubleshooting
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white font-medium mb-2">Launcher won't run?</p>
              <ul className="space-y-1 text-slate-300">
                <li>• Windows: Run as Administrator</li>
                <li>• Linux: Check file permissions (chmod +x)</li>
                <li>• Antivirus may block - add exception</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2">Results not showing?</p>
              <ul className="space-y-1 text-slate-300">
                <li>• Refresh dashboard page</li>
                <li>• Check internet connection</li>
                <li>• Verify you're logged in</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <p className="text-slate-300 text-sm">
              <strong className="text-white">Need help?</strong> See <a href="/docs" className="text-cyan-400 hover:underline">full documentation</a> or use the manual Python scanner method.
            </p>
          </div>
        </div>
      </div>

      {/* TOKEN MODAL - BULLETPROOF VERSION */}
      {showTokenModal && token && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 animate-fadeIn"
          style={{ 
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-slideUp"
            style={{ 
              border: '3px solid #10b981',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-emerald-500/30 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Download Complete!</h2>
                    <p className="text-slate-300 text-sm mt-1">Your authentication token is ready</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Token Display */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    🔑 Your Authentication Token
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Token
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 border-2 border-emerald-500/30 rounded-lg p-4">
                  <code className="text-cyan-400 text-sm font-mono break-all block select-all">
                    {token}
                  </code>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Quick Start - One Command Only!
                </h3>
                <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-4 mb-4">
                  <p className="text-xs text-slate-400 mb-2 font-semibold">📋 COPY AND RUN THIS COMMAND:</p>
                  <code className="block text-cyan-400 text-sm font-mono break-all select-all leading-relaxed">
                    cd Downloads && .\cis-scanner-windows.exe --token {token}
                  </code>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-1">1.</span>
                    <span><strong className="text-white">Open PowerShell</strong> (right-click Start → Windows PowerShell)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-1">2.</span>
                    <span><strong className="text-white">Paste the command above</strong> and press Enter</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-1">3.</span>
                    <span><strong className="text-white">Wait 30-60 seconds</strong> for scan to complete</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-1">4.</span>
                    <span><strong className="text-white">View results</strong> - dashboard opens automatically!</span>
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <p className="text-xs text-yellow-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>If you get a permission error, right-click PowerShell and select "Run as Administrator"</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Token
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
