import { CURRENCY_FIELDS, EMPLOYEE_KEYS, REQUIRED_FIELDS } from "./constants.js";

export function createEmptyEmployee() {
  return EMPLOYEE_KEYS.reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
}

export function normaliseDateInput(value = "") {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const dayFirstMatch = trimmed.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
  if (dayFirstMatch) {
    let [, day, month, year] = dayFirstMatch;
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const adjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return adjusted.toISOString().slice(0, 10);
  }

  return trimmed;
}

export function normaliseInputValue(field, rawValue) {
  const trimmed = rawValue.trim();
  if (field.type === "number") {
    return trimmed.replace(/[,\s]/g, "");
  }
  if (field.type === "date") {
    return normaliseDateInput(trimmed);
  }
  return trimmed;
}

export function parseNumber(rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }
  const normalised = String(rawValue).replace(/,/g, "");
  const value = Number(normalised);
  return Number.isFinite(value) ? value : null;
}

export function formatCurrency(value) {
  if (value === null) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value) {
  if (!value) {
    return "";
  }
  const isoCandidate = value.length === 10 && value.includes("-") ? value : null;
  const date = isoCandidate ? new Date(`${isoCandidate}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function makeErrorKey(rowIndex, fieldKey) {
  return `${rowIndex}:${fieldKey}`;
}

export function buildErrorSet(employeesList) {
  const nextErrors = new Set();
  employeesList.forEach((employee, rowIndex) => {
    REQUIRED_FIELDS.forEach((fieldKey) => {
      if (!employee[fieldKey]?.trim()) {
        nextErrors.add(makeErrorKey(rowIndex, fieldKey));
      }
    });
  });
  return nextErrors;
}

export function sanitiseFilename(name) {
  if (!name) {
    return "salary-pay-slip";
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "salary-pay-slip";
}

export function enrichEmployeeData(raw) {
  const enriched = { ...raw };
  enriched.employeeName = raw.employeeName || "-";
  enriched.employeeId = raw.employeeId || "-";
  enriched.designation = raw.designation || "-";
  enriched.department = raw.department || "-";
  enriched.payPeriod = raw.payPeriod || "-";
  enriched.payDate = formatDate(raw.payDate) || raw.payDate || "-";

  CURRENCY_FIELDS.forEach((key) => {
    const numericValue = parseNumber(raw[key]);
    enriched[key] = formatCurrency(numericValue);
  });

  enriched.mark = raw.mark || "-";

  const basic = parseNumber(raw.basicSalary) ?? 0;
  const house = parseNumber(raw.houseRentAllowance) ?? 0;
  const transport = parseNumber(raw.transportAllowance) ?? 0;
  const attendance = parseNumber(raw.attendanceBonus) ?? 0;
  const performance = parseNumber(raw.performanceBonus) ?? 0;
  const deductions = parseNumber(raw.otherDeductions) ?? 0;

  const providedTotal = parseNumber(raw.totalSalary);
  const computedTotal = basic + house + transport + attendance + performance - deductions;
  const finalTotal = providedTotal ?? computedTotal;

  enriched.totalSalary = formatCurrency(finalTotal);
  enriched.netSalary = `BDT ${formatCurrency(finalTotal)}`;

  return enriched;
}
