import React, { useRef, useState, useCallback, useEffect } from 'react';
import { liveScan } from '../services/api';
import './LiveScan.css';

const SCAN_INTERVAL_MS = 1500; 

const LiveScan = () => {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const timerRef   = useRef(null);

  const [active,    setActive]    = useState(false);
  const [scanning,  setScanning]  = useState(false);
  const [defects,   setDefects]   = useState([]);
  const [hasDefect, setHasDefect] = useState(false);
  const [frameCount,setFrameCount]= useState(0);
  const [error,     setError]     = useState('');
  const [fps,       setFps]       = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]); // Track detections in current session
  
  const fpsRef = useRef({ last: Date.now(), count: 0 });

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setError('');
    const constraints = [
      { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    let stream = null;
    for (const c of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(c);
        break;
      } catch (e) {
        console.warn('Failed to get camera:', e);
      }
    }

    if (!stream) {
      setError('Cannot access webcam. Please check permissions.');
      return;
    }

    streamRef.current = stream;
    setActive(true);
  }, []);

  /* ── Attach stream ── */
  useEffect(() => {
    if (active && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => videoRef.current.play().catch(console.error);
    }
  }, [active]);

  /* ── Stop ── */
  const stopAll = useCallback(() => {
    clearTimeout(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
    setScanning(false);
    setDefects([]);
  }, []);

  /* ── Capture & Send ── */
  const captureAndSend = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const data = await liveScan(blob);
        if (data.success) {
          setDefects(data.defects || []);
          setHasDefect(!!data.has_defects);
          
          if (data.has_defects) {
            // Add to session history
            setSessionHistory(prev => [
              {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                defects: data.defects,
                thumbnail: canvas.toDataURL('image/jpeg', 0.5)
              },
              ...prev.slice(0, 19) // Keep last 20
            ]);
          }
        }
        setFrameCount(c => c + 1);
      } catch (e) {
        console.error('Scan error:', e);
      }
    }, 'image/jpeg', 0.7);
  }, []);

  useEffect(() => {
    if (scanning && active) {
      const run = async () => {
        await captureAndSend();
        if (scanning) timerRef.current = setTimeout(run, SCAN_INTERVAL_MS);
      };
      run();
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [scanning, active, captureAndSend]);

  const severityColor = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('hole')) return '#ef4444';
    if (n.includes('stain') || n.includes('scratch')) return '#f97316';
    return '#a78bfa';
  };

  return (
    <div className="live-scan-revamped">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="live-main-grid">
        {/* ── Left: Camera Viewport ── */}
        <div className="live-viewport-container glass">
          {active ? (
            <div className="live-viewport-wrapper">
              <video ref={videoRef} className="live-video-element" autoPlay playsInline muted />
              
              {scanning && <div className="scanning-bar-anim" />}
              
              <div className="viewport-overlay">
                <div className={`status-pill ${hasDefect ? 'danger' : 'safe'}`}>
                  {hasDefect ? `⚠️ ${defects.length} DEFECTS` : scanning ? '✅ SCANNING...' : '⏸ PAUSED'}
                </div>
                <div className="viewport-meta">
                  <span>Frame: {frameCount}</span>
                </div>
              </div>

              {/* Corner brackets */}
              <div className="bracket tl" /><div className="bracket tr" />
              <div className="bracket bl" /><div className="bracket br" />
            </div>
          ) : (
            <div className="live-idle-state" onClick={startCamera}>
              <div className="idle-icon">🎥</div>
              <h3>Camera Inactive</h3>
              <p>Click to start real-time fabric scanning</p>
              <button className="start-btn-inline">Start Scanner</button>
            </div>
          )}

          <div className="live-controls-bar">
            {active && (
              <>
                <button 
                  className={`control-btn ${scanning ? 'pause' : 'resume'}`}
                  onClick={() => setScanning(!scanning)}
                >
                  {scanning ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button className="control-btn stop" onClick={stopAll}>⏹ Stop</button>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Session History ── */}
        <div className="live-history-panel glass">
          <div className="panel-header">
            <h4>Live Session History</h4>
            <span className="history-count">{sessionHistory.length} Detections</span>
          </div>
          
          <div className="history-list">
            {sessionHistory.length === 0 ? (
              <div className="history-empty">
                <p>No defects detected yet. Keep scanning...</p>
              </div>
            ) : (
              sessionHistory.map(item => (
                <div key={item.id} className="session-item animate-fade-in">
                  <img src={item.thumbnail} alt="Defect" className="item-thumb" />
                  <div className="item-info">
                    <div className="item-top">
                      <span className="item-time">{item.timestamp}</span>
                      <span className="item-count">{item.defects.length} Defect(s)</span>
                    </div>
                    <div className="item-tags">
                      {item.defects.map((d, i) => (
                        <span key={i} className="mini-tag" style={{ color: severityColor(d.name) }}>
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {error && <div className="live-error-bar">{error}</div>}
    </div>
  );
};

export default LiveScan;
