import React, { useRef } from "react";

export default function AssetUpload({ id, label, value, onChange, onClear, disabled }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    onChange(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="asset-field">
      <label htmlFor={id} className="asset-label">
        {label}
      </label>
      <div
        className="asset-upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        {value ? (
          <div className="asset-preview">
            <img src={value} alt={label} className="asset-preview-image" />
            <button
              type="button"
              className="btn-remove-asset"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={disabled}
              title="Remove"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <div className="asset-upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span className="upload-text">Click to upload or drag and drop</span>
            <span className="upload-hint">PNG, JPG, SVG up to 10MB</span>
          </div>
        )}
      </div>
    </div>
  );
}
