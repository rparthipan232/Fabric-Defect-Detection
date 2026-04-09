import React, { useRef, useState, useCallback, useEffect } from 'react';
import './Camera.css';

const Camera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);

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
        console.warn('Failed to get camera with constraints:', c, e);
      }
    }

    if (!stream) {
      setError('Cannot access webcam. Please make sure it is connected and you have granted permission.');
      return;
    }

    streamRef.current = stream;
    setActive(true);
  }, []);

  /* ── Attach stream to video element ── */
  useEffect(() => {
    if (active && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch(err => {
          console.error('Error playing webcam:', err);
          setError('Failed to display webcam preview.');
        });
      };
    }
  }, [active]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
    setCountdown(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    // 3‑second countdown
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(timer);
        setCountdown(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          const file = new File([blob], `webcam_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
        }, 'image/jpeg', 0.9);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [onCapture, stopCamera]);

  return (
    <div className="camera-container" id="camera-section">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!active ? (
        <button
          id="start-camera-btn"
          className="camera-open-btn"
          onClick={startCamera}
          aria-label="Open webcam"
        >
          <span className="camera-btn-icon">📷</span>
          Open Webcam
        </button>
      ) : (
        <div className="camera-viewport">
          <div className="camera-frame">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              aria-label="Webcam feed"
            />
            {countdown !== null && (
              <div className="camera-countdown" aria-live="polite">
                {countdown}
              </div>
            )}
            <div className="camera-corner tl" />
            <div className="camera-corner tr" />
            <div className="camera-corner bl" />
            <div className="camera-corner br" />
          </div>
          <div className="camera-actions">
            <button
              id="capture-photo-btn"
              className="btn-capture"
              onClick={capturePhoto}
              disabled={countdown !== null}
              aria-label="Capture photo"
            >
              {countdown !== null ? `📸 ${countdown}…` : '📸 Capture'}
            </button>
            <button
              id="stop-camera-btn"
              className="btn-stop"
              onClick={stopCamera}
              aria-label="Stop camera"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="camera-error" role="alert">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default Camera;
