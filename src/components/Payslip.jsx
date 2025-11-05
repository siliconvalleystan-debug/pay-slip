import React from "react";
import { DEFAULT_COMPANY_META } from "../constants.js";

export default function Payslip({ data, assets }) {
  const hasLogo = Boolean(assets.logo);
  const hasSignature = Boolean(assets.signature);

  return (
    <div className="payslip">
      <div className="brand-bar top" />
      <header className="payslip-header">
        <div className="logo">
          {hasLogo ? (
            <img src={assets.logo} alt="Company logo" className="asset-image logo-image" />
          ) : (
            <div className="logo-circle">
              <span className="logo-text">RT</span>
            </div>
          )}
          <div className="logo-caption">Remote Talent</div>
        </div>
      </header>
      <h1 className="payslip-title">Salary Pay Slip</h1>

      <table className="detail-table">
        <tbody>
          <tr>
            <td>Employee Name</td>
            <td>{data.employeeName}</td>
          </tr>
          <tr>
            <td>Employee ID</td>
            <td>{data.employeeId}</td>
          </tr>
          <tr>
            <td>Designation</td>
            <td>{data.designation}</td>
          </tr>
          <tr>
            <td>Department</td>
            <td>{data.department}</td>
          </tr>
          <tr>
            <td>Pay Period</td>
            <td>{data.payPeriod}</td>
          </tr>
          <tr>
            <td>Pay Date</td>
            <td>{data.payDate}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="section-heading">Earnings</h2>
      <table className="detail-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>{data.basicSalary}</td>
          </tr>
          <tr>
            <td>House Rent Allowance</td>
            <td>{data.houseRentAllowance}</td>
          </tr>
          <tr>
            <td>Transport Allowance</td>
            <td>{data.transportAllowance}</td>
          </tr>
          <tr>
            <td>Attendance Bonus</td>
            <td>{data.attendanceBonus}</td>
          </tr>
          <tr>
            <td>Mark</td>
            <td>{data.mark}</td>
          </tr>
          <tr>
            <td>Performance Bonus</td>
            <td>{data.performanceBonus}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="section-heading">Deductions</h2>
      <table className="detail-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Other Deductions</td>
            <td>{data.otherDeductions}</td>
          </tr>
          <tr>
            <td>Total Salary</td>
            <td>{data.totalSalary}</td>
          </tr>
        </tbody>
      </table>

      <p className="net-salary">
        Net Salary Payable: <strong>{data.netSalary}</strong>
      </p>

      <div className="signature-row">
        <div className="signature-block">
          <div className="signature-image-wrapper">
            {hasSignature ? (
              <img
                src={assets.signature}
                alt="Authorized signature or seal"
                className="asset-image signature-image"
              />
            ) : null}
          </div>
          <div className="signature-line" />
          <span>Authorized Signature:</span>
        </div>
        <div>
          <div className="signature-line" />
          <span>Employee Signature:</span>
        </div>
      </div>

      <footer className="payslip-footer">
        <div>
          <span className="footer-label">Company Name:</span> {DEFAULT_COMPANY_META.name}
        </div>
        <div>
          <span className="footer-label">Email Address:</span> {DEFAULT_COMPANY_META.email}
        </div>
        <div>
          <span className="footer-label">Office Address:</span> {DEFAULT_COMPANY_META.address}
        </div>
      </footer>
      <div className="brand-bar bottom" />
    </div>
  );
}
