import { useState } from 'react';
import { Download, Play, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';

export default function QuickScan() {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'https://cis-audit-api.onrender.com';

  const handleDownloadLauncher = (platform) => {
    setDownloadStatus(`Downloading ${platform} launcher...`);
    
    // Get access token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setDownloadStatus('Error: Not authenticated. Please login first.');
      return;
    }
    
    // Create download with embedded token
    const downloadUrl = `${API_URL}/downloads/cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}?token=${token}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `cis-scanner-${platform}${platform === 'windows' ? '.exe' : ''}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadStatus(`✅ ${platform} launcher downloaded! Run it to scan.`);
    
    // Clear status after 5 seconds
    setTimeout(() => setDownloadStatus(null), 5000);
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
                  <p className="font-medium text-white">Run as Administrator</p>
                  <p className="text-slate-400">Right-click → "Run as administrator"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold">3.</span>
                <div>
                  <p className="font-medium text-white">Allow Defender</p>
                  <p className="text-slate-400">Windows Defender may ask for confirmation</p>
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
                  <p className="text-slate-400">Dashboard opens automatically</p>
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
    </div>
  );
}
