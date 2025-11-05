import React from "react";
import { makeErrorKey } from "../utils.js";

export default function EmployeeRow({
  columns,
  employee,
  rowIndex,
  errors,
  onFieldChange,
  onRemove,
  onPaste,
  onGenerate,
  disableRemove,
  isGenerating,
}) {
  return (
    <tr>
      {columns.map((field, colIndex) => {
        const errorKey = makeErrorKey(rowIndex, field.key);
        const hasError = errors.has(errorKey);
        return (
          <td key={field.key}>
            <input
              data-key={field.key}
              data-row-index={rowIndex}
              data-col-index={colIndex}
              type={field.type === "number" ? "number" : field.type}
              inputMode={field.type === "number" ? "decimal" : undefined}
              step={field.type === "number" ? "0.01" : undefined}
              min={field.type === "number" ? "0" : undefined}
              value={employee[field.key] ?? ""}
              placeholder={field.placeholder ?? ""}
              className={hasError ? "input-error" : ""}
              onChange={(event) => onFieldChange(rowIndex, field, event.target.value)}
              onPaste={(event) => onPaste(event, rowIndex, colIndex)}
              autoComplete="off"
            />
          </td>
        );
      })}
      <td className="actions-header">
        <div className="row-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => onGenerate(rowIndex)}
            disabled={isGenerating}
          >
            Generate PDF
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => onRemove(rowIndex)}
            disabled={disableRemove || isGenerating}
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
