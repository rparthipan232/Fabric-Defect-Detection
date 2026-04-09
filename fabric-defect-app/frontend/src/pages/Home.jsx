import React, { useState, useRef, useCallback, useEffect } from 'react';
import Camera from '../components/Camera';
import ResultCard from '../components/ResultCard';
import LiveScan from '../components/LiveScan';
import { predictDefect, fetchHistory } from '../services/api';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab]       = useState('scanning'); // scanning | analysis | history
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL]     = useState(null);
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState('');
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Tab Change ── */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') {
      loadHistory();
    }
  };

  /* ── File Helpers ─────────────────────────────── */
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setResult(null);
    setError('');
  }, []);

  const onFileInputChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileSelect(file);
  }, [handleFileSelect]);

  const onDragOver = (e) => e.preventDefault();

  /* ── Analysis Logic ── */
  const runDetection = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setProgress(0);
    setResult(null);

    try {
      const data = await predictDefect(selectedFile, setProgress);
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Detection failed.';
      setError(`⚠️ ${msg}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── History Logic ── */
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  return (
    <main className="home-container" id="main-content">
      {/* ── Tabs Navigation ── */}
      <div className="tabs-header-wrapper">
        <div className="tabs-header glass">
          <button
            className={`tab-btn ${activeTab === 'scanning' ? 'active' : ''}`}
            onClick={() => handleTabChange('scanning')}
            id="tab-scanning"
          >
            <span>📡</span> Live Scanning
          </button>
          <button
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => handleTabChange('analysis')}
            id="tab-analysis"
          >
            <span>🖼️</span> Photo Analysis
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
            id="tab-history"
          >
            <span>📂</span> Prediction History
          </button>
        </div>
      </div>

      <div className="tab-content container animate-fade-in">

        {/* ─── Tab 1: Live Scanning ─── */}
        {activeTab === 'scanning' && (
          <div className="scanning-tab">
            <header className="section-header">
              <span className="section-tag">Real-Time Detection</span>
              <h1 className="section-main-title">Continuous Fabric Scan</h1>
              <p className="hero-subtitle">Point the camera at the fabric for instant defect tracking.</p>
            </header>
            <LiveScan />
          </div>
        )}

        {/* ─── Tab 2: Photo Analysis ─── */}
        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <header className="section-header">
              <span className="section-tag">Static Analysis</span>
              <h1 className="section-main-title">Analyse Fabric Image</h1>
              <p className="hero-subtitle">Upload a file or take a high-resolution photo for deep analysis.</p>
            </header>

            <div className="analysis-grid">
              <div className="analysis-upload glass">
                <div
                  className={`drop-zone-v2 ${previewURL ? 'has-image' : ''}`}
                  onClick={() => !previewURL && fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                >
                  {previewURL ? (
                    <div className="preview-container">
                      <img src={previewURL} alt="Preview" className="analysis-preview" />
                      <button className="clear-btn" onClick={(e) => { e.stopPropagation(); resetAnalysis(); }}>✕</button>
                    </div>
                  ) : (
                    <div className="drop-placeholder">
                      <div className="upload-icon">📁</div>
                      <p className="primary-text">Choose a file or drag it here</p>
                      <p className="secondary-text">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInputChange}
                  style={{ display: 'none' }}
                />

                <div className="or-divider"><span>OR</span></div>

                <div className="camera-trigger-wrap">
                  <Camera onCapture={handleFileSelect} />
                </div>

                <button
                  className={`analyse-main-btn ${loading ? 'loading' : ''}`}
                  onClick={runDetection}
                  disabled={!selectedFile || loading}
                >
                  {loading ? 'Analysing Fabric...' : 'Run Defect Detection'}
                </button>

                {error && <div className="error-card">{error}</div>}
              </div>

              <div className="analysis-result-panel">
                {result ? (
                  <ResultCard result={result} />
                ) : (
                  <div className="result-placeholder glass">
                    <div className="placeholder-content">
                      <span>🔍</span>
                      <p>Analysis results will appear here after scanning.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab 3: History ─── */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <header className="section-header">
              <span className="section-tag">Records</span>
              <h1 className="section-main-title">Prediction History</h1>
              <p className="hero-subtitle">Review all previous fabric defect detections.</p>
            </header>

            <div className="history-full-panel glass">
              {historyLoading ? (
                <div className="history-loading">
                  <div className="spinner"></div>
                  <p>Loading your history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="history-empty-state">
                  <p>No history found yet. Start by analysing some fabric!</p>
                </div>
              ) : (
                <div className="history-grid-v2">
                  {history.map((item, i) => (
                    <div className="history-card-v2" key={item._id || i}>
                      <div className="card-image-wrap">
                        {item.image_url && (
                          <img
                            src={`http://${window.location.hostname}:8000${item.image_url}`}
                            alt="Scan"
                          />
                        )}
                        <div className={`status-badge ${item.has_defects ? 'defect' : 'clean'}`}>
                          {item.has_defects ? 'Defective' : 'Clean'}
                        </div>
                      </div>
                      <div className="card-info">
                        <p className="card-date">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}</p>
                        {item.defects?.length > 0 && (
                          <div className="card-tags">
                            {item.defects.map((d, index) => (
                              <span key={index} className="defect-tag">{d.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
