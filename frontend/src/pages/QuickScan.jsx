import { useState } from 'react';
import { Download, Play, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';

export default function QuickScan() {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://cis-audit-api.onrender.com';

  const handleDownloadLauncher = (platform) => {
    setDownloadStatus(`Downloading ${platform} launcher...`);
    
    // Get access token from localStorage
    const userToken = localStorage.getItem('access_token');
    
    if (!userToken) {
      setDownloadStatus('Error: Not authenticated. Please login first.');
      return;
    }
    
    // Create download with embedded token
    const downloadUrl = `${API_URL}/downloads/cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}?token=${userToken}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadStatus(`✅ ${platform} launcher downloaded!`);
    
    // Show token both in modal AND alert
    setToken(userToken);
    setShowToken(true);
    setShowTokenModal(true);
    
    // Show browser alert as backup (after a delay so modal shows first)
    setTimeout(() => {
      alert(`✅ Token copied to clipboard!\n\nUse this command:\n\nset CIS_TOKEN=${userToken}\n\nThen run: cis-scanner-windows.exe`);
    }, 1500);
    
    // Copy to clipboard immediately
    navigator.clipboard.writeText(userToken);
    
    // Clear status after 5 seconds
    setTimeout(() => setDownloadStatus(null), 5000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token).then(() => {
      alert('✅ Token copied to clipboard!');
    }).catch(() => {
      alert('Please manually copy the token above');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-emerald-400" />
            Quick Scan
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

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowTokenModal(false)}>
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-8 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Download Complete!</h2>
                <p className="text-slate-400 text-sm">Copy your authentication token below</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-400 mb-2">Your Authentication Token:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-cyan-400 text-sm font-mono break-all bg-slate-950 p-3 rounded border border-slate-700">
                  {token}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                How to Use:
              </h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Open <strong className="text-white">Command Prompt as Administrator</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Navigate to Downloads: <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">cd Downloads</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Set token: <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">set CIS_TOKEN=PASTE_TOKEN_HERE</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Run scanner: <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">cis-scanner-windows.exe</code></span>
                </li>
              </ol>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Token & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
