import React from 'react';
import './ResultCard.css';

const SEVERITY_MAP = {
  hole:    { color: '#ef4444', icon: '🔴', level: 'High' },
  stain:   { color: '#f97316', icon: '🟠', level: 'Medium' },
  thread:  { color: '#eab308', icon: '🟡', level: 'Low' },
  scratch: { color: '#f97316', icon: '🟠', level: 'Medium' },
  defect:  { color: '#ef4444', icon: '🔴', level: 'High' },
};

const getSeverity = (name) => {
  const key = Object.keys(SEVERITY_MAP).find((k) =>
    name.toLowerCase().includes(k)
  );
  return key ? SEVERITY_MAP[key] : { color: '#a78bfa', icon: '🟣', level: 'Unknown' };
};

const ResultCard = ({ result }) => {
  if (!result) return null;

  const { defects = [], has_defects, result_image_base64, result_image_url } = result;

  const imageSrc =
    result_image_base64 ||
    (result_image_url ? `http://127.0.0.1:8000${result_image_url}` : null);

  return (
    <div className="result-card" id="result-section" aria-live="polite">
      {/* ─── Status Banner ─── */}
      <div className={`result-banner ${has_defects ? 'banner-alert' : 'banner-ok'}`}>
        {has_defects ? (
          <>⚠️ <strong>{defects.length} Defect{defects.length !== 1 ? 's' : ''} Detected</strong></>
        ) : (
          <>✅ <strong>No Defects Found — Fabric is Clear!</strong></>
        )}
      </div>

      {/* ─── Detected Image ─── */}
      {imageSrc && (
        <div className="result-image-wrapper">
          <img
            src={imageSrc}
            alt="Detection result with bounding boxes"
            className="result-image"
            id="result-image"
          />
          <div className="result-image-label">AI Annotated Result</div>
        </div>
      )}

      {/* ─── Defect List ─── */}
      {has_defects && defects.length > 0 && (
        <div className="defect-list" id="defect-list">
          <h3 className="defect-list-title">Defect Details</h3>
          <div className="defect-grid">
            {defects.map((d, i) => {
              const sv = getSeverity(d.name || '');
              const conf = typeof d.confidence === 'number'
                ? (d.confidence * 100).toFixed(1)
                : '—';
              return (
                <div
                  key={i}
                  className="defect-item"
                  style={{ '--accent': sv.color }}
                  id={`defect-item-${i}`}
                >
                  <span className="defect-icon">{sv.icon}</span>
                  <div className="defect-info">
                    <span className="defect-name">{d.name || 'Unknown'}</span>
                    <span className="defect-severity" style={{ color: sv.color }}>
                      {sv.level} Risk
                    </span>
                  </div>
                  <div className="defect-conf-bar">
                    <div
                      className="defect-conf-fill"
                      style={{ width: `${conf}%`, background: sv.color }}
                    />
                  </div>
                  <span className="defect-conf-label">{conf}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!has_defects && (
        <div className="no-defects-msg">
          <span className="no-defects-icon">🎉</span>
          <p>This fabric sample passed inspection with no issues.</p>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
