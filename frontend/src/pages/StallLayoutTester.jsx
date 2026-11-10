import { useState, useRef } from 'react';
import { parseStallLayout } from '../api/stallApi';
import './StallLayoutTester.css';

const TIER_COLORS = {
  PREMIUM: { border: '#E67E22', bg: 'rgba(230, 126, 34, 0.28)', label: 'Premium (Orange)' },
  REGULAR: { border: '#F1C40F', bg: 'rgba(241, 196, 15, 0.32)', label: 'Regular (Yellow)' },
  CLASSIC: { border: '#2ECC71', bg: 'rgba(46, 204, 113, 0.28)', label: 'Classic (Green)' },
  SINGLE_TABLE: { border: '#3498DB', bg: 'rgba(52, 152, 219, 0.28)', label: 'Single Table (Blue)' },
};

export default function StallLayoutTester() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredStall, setHoveredStall] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showRawJson, setShowRawJson] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStalls([]);
    setError(null);
    setHoveredStall(null);
  };

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/shree-sakhi-layout.jpg');
      const blob = await res.blob();
      const file = new File([blob], 'shree-sakhi-layout.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setImagePreview('/shree-sakhi-layout.jpg');
      setStalls([]);
    } catch (err) {
      setError('Could not load sample floor plan image.');
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      const data = await parseStallLayout(selectedFile);
      setStalls(data || []);
      if (!data || data.length === 0) {
        setError('No color-coded stalls were detected. Verify that the image uses the specified tier colors.');
      }
    } catch (err) {
      setError(err.message || 'Failed to parse layout image.');
    } finally {
      setLoading(false);
    }
  };

  const countsByCategory = stalls.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const displayedStalls = stalls.filter(s => filterCategory === 'ALL' || s.category === filterCategory);

  return (
    <div className="layout-tester-page">
      <div className="layout-tester-container">
        <header className="layout-tester-header">
          <span className="layout-tester-tag">Computer Vision Tool</span>
          <h1>OpenCV Stall Layout Parser</h1>
          <p>
            Upload an event floor plan layout image to extract stall bounding boxes in real-time
            using HSV color-thresholding segmentation.
          </p>
        </header>

        {/* Upload Controls */}
        <div className="layout-tester-controls">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn--outline"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Choose Layout Image
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleLoadSample}
            title="Load the Shree Sakhi official floor plan"
          >
            🎯 Load Shree Sakhi Layout
          </button>

          {selectedFile && (
            <span className="file-name-label">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          )}

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleParse}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Processing via OpenCV...' : '⚡ Run Detection Pipeline'}
          </button>
        </div>

        {error && (
          <div className="layout-tester-alert layout-tester-alert--error">
            ⚠️ {error}
          </div>
        )}

        {/* Stats & Legend */}
        {stalls.length > 0 && (
          <div className="layout-tester-summary">
            <div className="summary-badges">
              <span className="summary-total">Total Detected: <strong>{stalls.length}</strong></span>
              {Object.keys(TIER_COLORS).map(tier => (
                <button
                  key={tier}
                  type="button"
                  className={`tier-badge ${filterCategory === tier ? 'tier-badge--active' : ''}`}
                  style={{
                    borderColor: TIER_COLORS[tier].border,
                    background: filterCategory === tier ? TIER_COLORS[tier].bg : 'transparent',
                    color: filterCategory === tier ? TIER_COLORS[tier].border : 'var(--color-text)'
                  }}
                  onClick={() => setFilterCategory(prev => prev === tier ? 'ALL' : tier)}
                >
                  <span className="tier-dot" style={{ background: TIER_COLORS[tier].border }}></span>
                  {tier}: <strong>{countsByCategory[tier] || 0}</strong>
                </button>
              ))}
              {filterCategory !== 'ALL' && (
                <button
                  type="button"
                  className="tier-badge-reset"
                  onClick={() => setFilterCategory('ALL')}
                >
                  Show All
                </button>
              )}
            </div>

            <div className="summary-actions">
              <button
                type="button"
                className={`btn btn--ghost btn--toggle ${showLabels ? 'btn--toggle-active' : ''}`}
                onClick={() => setShowLabels(prev => !prev)}
                title="Toggle stall category labels"
              >
                🏷️ {showLabels ? 'Hide Labels' : 'Show Labels'}
              </button>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowRawJson(prev => !prev)}
              >
                {showRawJson ? 'Hide JSON' : 'View Raw JSON'}
              </button>
            </div>
          </div>
        )}

        {/* Interactive Layout Canvas */}
        {imagePreview && (
          <div className="canvas-wrapper">
            <div className="layout-canvas" id="stall-layout-canvas">
              <img
                src={imagePreview}
                alt="Floor Plan Source"
                className="canvas-image"
              />

              {displayedStalls.map((stall, idx) => {
                const tierStyle = TIER_COLORS[stall.category] || { border: '#e91e63', bg: 'rgba(233, 30, 99, 0.2)' };
                const isHovered = hoveredStall === idx;

                return (
                  <div
                    key={idx}
                    className={`stall-bounding-box ${isHovered ? 'stall-bounding-box--hovered' : ''}`}
                    style={{
                      left: `${stall.xPercent}%`,
                      top: `${stall.yPercent}%`,
                      width: `${stall.widthPercent}%`,
                      height: `${stall.heightPercent}%`,
                      borderColor: tierStyle.border,
                      backgroundColor: tierStyle.bg,
                    }}
                    onMouseEnter={() => setHoveredStall(idx)}
                    onMouseLeave={() => setHoveredStall(null)}
                  >
                    {showLabels && (
                      <span
                        className="stall-box-label"
                        style={{ background: tierStyle.border }}
                      >
                        {stall.category === 'SINGLE_TABLE' ? 'TABLE' : stall.category}
                      </span>
                    )}

                    {isHovered && (
                      <div className="stall-tooltip">
                        <div className="tooltip-title">Stall #{idx + 1} • {stall.category}</div>
                        <div>X: {stall.xPercent}% | Y: {stall.yPercent}%</div>
                        <div>W: {stall.widthPercent}% | H: {stall.heightPercent}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Raw JSON Inspection */}
        {showRawJson && stalls.length > 0 && (
          <div className="raw-json-panel">
            <h3>Normalized Output Coordinates ({stalls.length} items)</h3>
            <pre><code>{JSON.stringify(stalls, null, 2)}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}
