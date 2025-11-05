export const FIELD_DEFINITIONS = [
  { key: "employeeName", label: "Employee Name", type: "text", placeholder: "Nazmul Hassan" },
  { key: "employeeId", label: "Employee ID", type: "text", placeholder: "IT-003" },
  { key: "designation", label: "Designation", type: "text", placeholder: "Front-End Developer" },
  { key: "department", label: "Department", type: "text", placeholder: "IT" },
  { key: "payPeriod", label: "Pay Period", type: "text", placeholder: "September 2025" },
  { key: "payDate", label: "Pay Date", type: "date" },
  { key: "basicSalary", label: "Basic Salary", type: "number", placeholder: "35400" },
  { key: "houseRentAllowance", label: "House Rent Allowance", type: "number", placeholder: "0" },
  { key: "transportAllowance", label: "Transport Allowance", type: "number", placeholder: "0" },
  { key: "attendanceBonus", label: "Attendance Bonus", type: "number", placeholder: "500" },
  { key: "mark", label: "Mark", type: "number", placeholder: "87" },
  { key: "performanceBonus", label: "Performance Bonus", type: "number", placeholder: "4000" },
  { key: "otherDeductions", label: "Other Deductions", type: "number", placeholder: "0" },
  { key: "totalSalary", label: "Total Salary", type: "number", placeholder: "39900" },
];

export const REQUIRED_FIELDS = [
  "employeeName",
  "employeeId",
  "designation",
  "department",
  "payPeriod",
  "payDate",
];

export const CURRENCY_FIELDS = [
  "basicSalary",
  "houseRentAllowance",
  "transportAllowance",
  "attendanceBonus",
  "performanceBonus",
  "otherDeductions",
  "totalSalary",
];

export const DEFAULT_COMPANY_META = {
  name: "Remote Talent Ltd.",
  email: "info@heyremotetalent.com",
  address: "Suite 11/B, Level 11, Al Amin Millennium Tower, 75/76 Kakrail, Dhaka 1000",
};

export const EMPLOYEE_KEYS = FIELD_DEFINITIONS.map((field) => field.key);
