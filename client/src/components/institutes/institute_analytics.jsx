import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || 6100;

export default function InstituteAnalytics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Filters
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("");

  // 📥 Fetch analytics
  useEffect(() => {
    axios
      .get(`http://localhost:${BACKEND_PORT}/institute-api/analytics`)
      .then(res => {
        const safeData = (res.data || []).map(r => ({
          ...r,
          Employee_Name: r.Employee_Name || "",
          Designation: r.Designation || "",
          Diseases: Array.isArray(r.Diseases) ? r.Diseases : [],
          Medicines_Taken: Array.isArray(r.Medicines_Taken)
            ? r.Medicines_Taken
            : [],
          Tests: Array.isArray(r.Tests) ? r.Tests : [],
          Diagnosis_Notes: r.Diagnosis_Notes || "",
        }));

        setRows(safeData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Analytics load error", err);
        setRows([]);
        setLoading(false);
      });
  }, []);

  // 🔍 Filter logic (SAFE)
  const filteredRows = rows.filter(r => {
    const empMatch =
      employeeFilter === "" ||
      r.Employee_Name.toLowerCase().includes(employeeFilter.toLowerCase());

    const diseaseMatch =
      diseaseFilter === "" ||
      r.Diseases.some(d =>
        d.toLowerCase().includes(diseaseFilter.toLowerCase())
      );

    const medicineMatch =
      medicineFilter === "" ||
      r.Medicines_Taken.some(m =>
        m.Medicine_Name?.toLowerCase().includes(medicineFilter.toLowerCase())
      );

    return empMatch && diseaseMatch && medicineMatch;
  });

  if (loading) {
    return <div className="text-center mt-5">Loading analytics...</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3 text-center">Institute Medical Analytics</h4>

      {/* 🔍 Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search Employee"
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search Disease"
            value={diseaseFilter}
            onChange={e => setDiseaseFilter(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search Medicine"
            value={medicineFilter}
            onChange={e => setMedicineFilter(e.target.value)}
          />
        </div>
      </div>

      {/* 📊 Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Diseases</th>
              <th>Diagnosis</th>
              <th>Medicines Taken</th>
              <th>Tests</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found
                </td>
              </tr>
            )}

            {filteredRows.map((r, i) => (
              <tr key={i}>
                <td>
                  <strong>{r.Employee_Name || "—"}</strong>
                  <br />
                  <small>{r.Designation || "—"}</small>
                </td>

                <td>
                  {(r.Diseases || []).length
                    ? r.Diseases.join(", ")
                    : "—"}
                </td>

                <td>{r.Diagnosis_Notes || "—"}</td>

                <td>
                  {(r.Medicines_Taken || []).length
                    ? r.Medicines_Taken.map((m, idx) => (
                        <div key={idx}>
                          {m.Medicine_Name || "—"} ({m.Quantity || 0})
                        </div>
                      ))
                    : "—"}
                </td>

                <td>
                  {(r.Tests || []).length
                    ? r.Tests.map((t, idx) => (
                        <div key={idx}>
                          <strong>{t.Test_Name}</strong>: {t.Result_Value}
                        </div>
                      ))
                    : "—"}
                </td>

                <td>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("en-GB")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
