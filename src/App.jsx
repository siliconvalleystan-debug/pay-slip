import React, { useCallback, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import html2pdf from "html2pdf.js";
import { FIELD_DEFINITIONS, REQUIRED_FIELDS } from "./constants.js";
import {
  buildErrorSet,
  createEmptyEmployee,
  enrichEmployeeData,
  makeErrorKey,
  normaliseInputValue,
  sanitiseFilename,
} from "./utils.js";
import AssetUpload from "./components/AssetUpload.jsx";
import EmployeeRow from "./components/EmployeeRow.jsx";
import Payslip from "./components/Payslip.jsx";

export default function App() {
  const [employees, setEmployees] = useState(() => [createEmptyEmployee()]);
  const [errors, setErrors] = useState(new Set());
  const [previewData, setPreviewData] = useState(null);
  const [assets, setAssets] = useState({ logo: null, signature: null });
  const [generatingRow, setGeneratingRow] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const updateErrors = useCallback((nextErrors) => {
    setErrors(new Set(nextErrors));
  }, []);

  const clearErrorForField = useCallback(
    (rowIndex, fieldKey) => {
      const key = makeErrorKey(rowIndex, fieldKey);
      if (!errors.has(key)) {
        return;
      }
      const next = new Set(errors);
      next.delete(key);
      updateErrors(next);
    },
    [errors, updateErrors]
  );

  const validateEmployee = useCallback(
    (rowIndex, employee) => {
      let valid = true;
      const nextErrors = new Set(errors);

      REQUIRED_FIELDS.forEach((fieldKey) => {
        const key = makeErrorKey(rowIndex, fieldKey);
        if (!employee[fieldKey]?.trim()) {
          nextErrors.add(key);
          valid = false;
        } else {
          nextErrors.delete(key);
        }
      });

      updateErrors(nextErrors);
      return valid;
    },
    [errors, updateErrors]
  );

  const handleFieldChange = useCallback(
    (rowIndex, field, rawValue) => {
      setEmployees((prev) => {
        const next = prev.slice();
        next[rowIndex] = {
          ...next[rowIndex],
          [field.key]: normaliseInputValue(field, rawValue),
        };
        return next;
      });
      if (rawValue.trim()) {
        clearErrorForField(rowIndex, field.key);
      }
    },
    [clearErrorForField]
  );

  const handleAddRow = useCallback(() => {
    setEmployees((prev) => prev.concat(createEmptyEmployee()));
  }, []);

  const handleRemoveRowAt = useCallback(
    (rowIndex) => {
      setEmployees((prev) => {
        if (prev.length === 1) {
          return prev;
        }
        const next = prev.filter((_, index) => index !== rowIndex);
        updateErrors(buildErrorSet(next));
        return next;
      });
    },
    [updateErrors]
  );

  const handleAssetChange = useCallback((key, file) => {
    if (!file) {
      setAssets((prev) => ({ ...prev, [key]: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file (PNG, JPG, SVG, etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAssets((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAssetClear = useCallback((key) => {
    setAssets((prev) => ({ ...prev, [key]: null }));
  }, []);

  const handlePaste = useCallback(
    (event, startRowIndex, startColIndex) => {
      const clipboard = event.clipboardData?.getData("text/plain");
      if (!clipboard) {
        return;
      }

      const hasStructure = clipboard.includes("\n") || clipboard.includes("\t");
      if (!hasStructure) {
        return;
      }

      event.preventDefault();
      const lines = clipboard
        .replace(/\r\n/g, "\n")
        .split("\n")
        .filter((line) => line.trim().length > 0);

      let updatedEmployees = null;
      setEmployees((prev) => {
        let next = prev.slice();
        let currentRowIndex = startRowIndex;

        lines.forEach((line) => {
          const values = line.split("\t");
          while (next.length <= currentRowIndex) {
            next = next.concat(createEmptyEmployee());
          }

          const rowDraft = { ...next[currentRowIndex] };
          let currentColIndex = startColIndex;

          values.forEach((value) => {
            if (currentColIndex >= FIELD_DEFINITIONS.length) {
              return;
            }
            const field = FIELD_DEFINITIONS[currentColIndex];
            rowDraft[field.key] = normaliseInputValue(field, value);
            currentColIndex += 1;
          });

          next[currentRowIndex] = rowDraft;
          currentRowIndex += 1;
        });

        updatedEmployees = next;
        return next;
      });
      if (updatedEmployees) {
        updateErrors(buildErrorSet(updatedEmployees));
      }
    },
    [updateErrors]
  );

  const handleGenerateForRow = useCallback(
    async (rowIndex) => {
      const employee = employees[rowIndex];
      if (!employee) {
        return;
      }

      const isValid = validateEmployee(rowIndex, employee);
      if (!isValid) {
        window.alert("Please complete all required fields before generating the pay slip.");
        return;
      }

      const enriched = enrichEmployeeData(employee);
      setPreviewData(enriched);

      setGeneratingRow(rowIndex);

      const wrapper = document.createElement("div");
      wrapper.innerHTML = renderToStaticMarkup(<Payslip data={enriched} assets={assets} />);
      const node = wrapper.firstElementChild;
      document.body.appendChild(node);

      const filename = `${sanitiseFilename(enriched.employeeName)}-pay-slip.pdf`;
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      try {
        await html2pdf().set(options).from(node).save();
      } catch (error) {
        console.error("Failed to export PDF", error);
        window.alert("Unable to generate the PDF. Check the console for details.");
      } finally {
        node.remove();
        setGeneratingRow(null);
      }
    },
    [assets, employees, validateEmployee]
  );

  const handleGenerateAll = useCallback(async () => {
    if (!employees.length) {
      window.alert("Add at least one employee before generating PDFs.");
      return;
    }
    setBulkGenerating(true);
    for (let index = 0; index < employees.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await handleGenerateForRow(index);
    }
    setBulkGenerating(false);
  }, [employees, handleGenerateForRow]);

  const disableRemove = employees.length === 1 || bulkGenerating || generatingRow !== null;

  const previewContent = useMemo(() => {
    if (!previewData) {
      return (
        <div className="preview-placeholder">
          Generate a pay slip to refresh the preview before exporting.
        </div>
      );
    }
    return <Payslip data={previewData} assets={assets} />;
  }, [assets, previewData]);

  return (
    <main className="layout">
      <section className="panel">
        <h1>Salary Pay Slip Generator</h1>
        <p className="description">
          Enter employee payroll details row-by-row and export polished pay slip PDFs that mirror the
          provided template.
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn secondary"
            onClick={handleAddRow}
            disabled={bulkGenerating || generatingRow !== null}
          >
            Add Employee
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={handleGenerateAll}
            disabled={bulkGenerating || generatingRow !== null}
          >
            Generate PDFs for All
          </button>
        </div>

        <div className="asset-controls">
          <AssetUpload
            id="logo-upload"
            label="Company Logo"
            value={assets.logo}
            disabled={bulkGenerating || generatingRow !== null}
            onChange={(file) => handleAssetChange("logo", file)}
            onClear={() => handleAssetClear("logo")}
          />
          <AssetUpload
            id="signature-upload"
            label="Authorized Signature / Seal"
            value={assets.signature}
            disabled={bulkGenerating || generatingRow !== null}
            onChange={(file) => handleAssetChange("signature", file)}
            onClear={() => handleAssetClear("signature")}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {FIELD_DEFINITIONS.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <EmployeeRow
                  key={index}
                  columns={FIELD_DEFINITIONS}
                  employee={employee}
                  rowIndex={index}
                  errors={errors}
                  onFieldChange={handleFieldChange}
                  onRemove={handleRemoveRowAt}
                  onPaste={handlePaste}
                  onGenerate={handleGenerateForRow}
                  disableRemove={disableRemove}
                  isGenerating={bulkGenerating || generatingRow === index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel preview-panel">
        <h2>Latest Pay Slip Preview</h2>
        <div className="preview-surface">{previewContent}</div>
      </section>
    </main>
  );
}
