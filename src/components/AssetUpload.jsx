import React from "react";

export default function AssetUpload({ id, label, value, onChange, onClear, disabled }) {
  return (
    <div className="asset-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        disabled={disabled}
      />
      <button
        type="button"
        className="btn ghost"
        onClick={onClear}
        disabled={disabled || !value}
      >
        Remove
      </button>
    </div>
  );
}
