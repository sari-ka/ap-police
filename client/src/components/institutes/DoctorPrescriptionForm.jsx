import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PatientSelector from "../institutes/PatientSelector";

const DoctorPrescriptionForm = () => {
  const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || 6100;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [medicineSearch, setMedicineSearch] = useState("");
//   const [employees, setEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [lastTwoVisits, setLastTwoVisits] = useState([]);
  const [visitSymptoms, setVisitSymptoms] = useState("");
  const [visitDetails, setVisitDetails] = useState(null);


//   const [inventory, setInventory] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
  const [instituteName, setInstituteName] = useState("");
//   const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [visitId, setVisitId] = useState(null);
//   const [medicineErrors, setMedicineErrors] = useState({});

  const [formData, setFormData] = useState({
    Institute_ID: "",
    Employee_ID: "",
    IsFamilyMember: false,
    FamilyMember_ID: "",
    Medicines: [{ medicineId: "", medicineName: "", expiryDate: "", quantity: 0 }],
    Notes: ""
  });
  const formatDateDMY = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "—";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  };


  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const instituteId = localStorage.getItem("instituteId");
    if (!instituteId) return;

    setFormData((f) => ({ ...f, Institute_ID: instituteId }));
    fetchInstitute(instituteId);
    // fetchEmployees();
    // fetchInventory(instituteId);
  }, []);

  

  const fetchTopTwoPrescriptions = async (employeeId) => {
    try {
      const res = await axios.get(
        `http://localhost:${BACKEND_PORT}/prescription-api/employee/${employeeId}`
      );
  
      // Sort latest first (safety)
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  
      // Take top 2
      setLastTwoVisits(sorted.slice(0, 2));
    } catch (err) {
      console.error(err);
      setLastTwoVisits([]);
    }
  };
  
  

  /* ================= API CALLS ================= */
  const fetchInstitute = async (id) => {
    const res = await axios.get(
      `http://localhost:${BACKEND_PORT}/institute-api/institution/${id}`
    );
    setInstituteName(res.data?.Institute_Name || "");
  };


  const fetchDiseases = async (employeeId) => {
    try {
      const res = await axios.get(
        `http://localhost:${BACKEND_PORT}/disease-api/employee/${employeeId}`
      );
      setDiseases(res.data || []);
    } catch {
      setDiseases([]);
    }
  };

  const fetchVisitDetails = async (visitId) => {
    try {
      const res = await axios.get(
        `http://localhost:${BACKEND_PORT}/api/visits/${visitId}`
      );
      setVisitDetails(res.data);
    } catch {
      setVisitDetails(null);
    }
  };
  
  
  useEffect(() => {
    if (!formData.Employee_ID) return;

    axios
      .get(
        `http://localhost:${BACKEND_PORT}/employee-api/profile/${formData.Employee_ID}`
      )
      .then((res) => setEmployeeProfile(res.data))
      .catch(() => setEmployeeProfile(null));
  }, [formData.Employee_ID]);

  // 🔁 When switching back to EMPLOYEE, reload latest employee visit
    useEffect(() => {
      if (
        formData.IsFamilyMember ||        // only run when employee mode
        !formData.Employee_ID
      ) return;

      axios
        .get(
          `http://localhost:${BACKEND_PORT}/api/visits/employee/latest/${formData.Employee_ID}`
        )
        .then(res => setVisitDetails(res.data))
        .catch(() => setVisitDetails(null));
    }, [formData.IsFamilyMember, formData.Employee_ID]);


  /* ================= FAMILY MEMBERS ================= */
  useEffect(() => {
    if (!formData.Employee_ID) {
      setFamilyMembers([]);
      return;
    }

    axios
      .get(
        `http://localhost:${BACKEND_PORT}/family-api/family/${formData.Employee_ID}`
      )
      .then((res) => setFamilyMembers(res.data || []));
  }, [formData.Employee_ID]);

  /* ================= DISEASE FILTER ================= */
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const relevantDiseases = diseases.filter((d) => {
    if (formData.IsFamilyMember) {
      return String(d.FamilyMember_ID?._id) === String(formData.FamilyMember_ID);
    }
    return !d.IsFamilyMember;
  });

  const communicableRecent = relevantDiseases.filter(
    (d) =>
      d.Category === "Communicable" &&
      new Date(d.createdAt) >= twoMonthsAgo
  );


  const addMedicine = () =>
    setFormData((prev) => ({
      ...prev,
      Medicines: [
        ...prev.Medicines,
        { medicineId: "", medicineName: "", quantity: 0 }
      ]
    }));

  const removeMedicine = (index) =>
    setFormData((prev) => ({
      ...prev,
      Medicines: prev.Medicines.filter((_, i) => i !== index)
    }));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // const hasHardError = Object.values(medicineErrors).some(
    //   (msg) => msg.startsWith("❌")
    // );

    // if (hasHardError) {
    //   alert("❌ Fix stock / quantity errors before submitting");
    //   return;
    // }

    if (!formData.Employee_ID) {
      alert("Please select an employee");
      return;
    }

    if (formData.IsFamilyMember && !formData.FamilyMember_ID) {
      alert("Please select a family member");
      return;
    }

    const payload = {
      Institute_ID: formData.Institute_ID,
      Employee_ID: formData.Employee_ID,
      IsFamilyMember: formData.IsFamilyMember,
      FamilyMember_ID: formData.IsFamilyMember ? formData.FamilyMember_ID : null,
      Medicines: formData.Medicines.map((m) => ({
        Medicine_ID: m.medicineId,
        Medicine_Name: m.medicineName,
        Expiry_Date: m.expiryDate,
        Quantity: Number(m.quantity)
      })),
      Notes: formData.Notes
    };

    await axios.post(`http://localhost:${BACKEND_PORT}/api/medical-actions`, {
      employee_id: formData.Employee_ID,
      visit_id: formData.visit_id || null,
      action_type: "DOCTOR_PRESCRIPTION",
      source: "DOCTOR",
      data: {
        IsFamilyMember: formData.IsFamilyMember,
        FamilyMember_ID: formData.IsFamilyMember
          ? formData.FamilyMember_ID
          : null,
        medicines: formData.Medicines.map(m => ({
          Medicine_ID: m.medicineId,
          Medicine_Name: m.medicineName,
          Quantity: Number(m.quantity)
        })),
        notes: formData.Notes
      }
    });

    alert("✅ Prescription saved successfully");
  };
  useEffect(() => {
    if (
      !formData.IsFamilyMember ||
      !formData.FamilyMember_ID ||
      !formData.Employee_ID
    ) return;
  
    const family = familyMembers.find(
      f => f._id === formData.FamilyMember_ID
    );
  
    if (!family) return;
  
    axios
      .get(
        `http://localhost:${BACKEND_PORT}/api/visits/family/latest/${formData.Employee_ID}/${family.Name}`
      )
      .then(res => setVisitDetails(res.data))
      .catch(() => setVisitDetails(null));
  }, [formData.IsFamilyMember, formData.FamilyMember_ID]);
  
// Employee context → match by ABS_NO
const isEmployeeContext =
  !formData.IsFamilyMember &&
  visitDetails?.patient?.type === "EMPLOYEE" &&
  String(visitDetails?.employee_id) === String(formData.Employee_ID);

// Family context → match by selected family member name
const selectedFamilyName =
  familyMembers.find(f => f._id === formData.FamilyMember_ID)?.Name;

const isFamilyContext =
  formData.IsFamilyMember &&
  formData.FamilyMember_ID &&
  visitDetails?.patient?.type === "FAMILY" &&
  visitDetails?.patient?.name === selectedFamilyName;


  /* ================= UI ================= */
  return (
    
    <div className="container-fluid mt-4">
      <div className="row justify-content-center">
        {/* FORM */}
        <div className="col-lg-8">
          <div className="card shadow border-0">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Doctor Prescription</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Institute</label>
                  <input className="form-control" value={instituteName} readOnly />
                </div>

                {/* <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">Employee ABS_NO</label>
                  <input
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type ABS_NO"
                  />

                  {filteredEmployees.length > 0 && (
                    <div className="list-group position-absolute w-100 z-3">
                      {filteredEmployees.map((e) => (
                        <button
                          type="button"
                          key={e._id}
                          className="list-group-item list-group-item-action"
                          onClick={() => selectEmployee(e)}
                        >
                          {e.ABS_NO} — {e.Name}
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}
                <PatientSelector
                    onSelect={({ employee, visit_id }) => {
                        setSelectedEmployee(employee);
                        setVisitId(visit_id);

                        setFormData(prev => ({
                        ...prev,
                        Employee_ID: employee._id,
                        visit_id: visit_id,
                        IsFamilyMember: false,
                        FamilyMember_ID: ""
                        }));
                       

                        fetchDiseases(employee._id);
                        fetchTopTwoPrescriptions(employee._id); // ✅ ADD THIS

                        if (visit_id) {
                          fetchVisitDetails(visit_id);
                        }
                    }}
                    />


                {/* FAMILY MEMBER */}
                <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.IsFamilyMember}
                onChange={(e) => {
                  const checked = e.target.checked;
                
                  setFormData((f) => ({
                    ...f,
                    IsFamilyMember: checked,
                    FamilyMember_ID: ""
                  }));
                
                  // only clear when switching CONTEXT
                  if (!checked) {
                    setVisitDetails(null); // switching back to employee
                  }
                }}
                
              />
              <label className="form-check-label">
                Prescription for Family Member
              </label>
            </div>


                {formData.IsFamilyMember && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Select Family Member
                    </label>
                    <select
                      className="form-select"
                      value={formData.FamilyMember_ID}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          FamilyMember_ID: e.target.value
                        }))
                      }
                    >
                      <option value="">Select Family Member</option>
                      {familyMembers.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.Name} ({f.Relationship})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
             {isEmployeeContext && visitDetails?.patient?.symptoms && (
                <div className="alert alert-info mt-3">
                  <strong>Employee Symptoms:</strong>{" "}
                  {visitDetails.patient.symptoms}
                </div>
              )}

              {isFamilyContext && visitDetails?.patient?.symptoms && (
                <div className="alert alert-info mt-3">
                  <strong>Family Member Symptoms:</strong>{" "}
                  {visitDetails.patient.symptoms}
                </div>
)}




                {communicableRecent.length > 0 && (
                  <div className="alert alert-warning">
                    <strong>Disease History (Reference Only)</strong>
                    <ul className="mb-0 mt-2">
                      {communicableRecent.map((d, i) => (
                        <li key={i}>{d.Disease_Name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <h6 className="fw-bold mt-4">Medicines</h6>

                {formData.Medicines.map((med, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex gap-2 align-items-start">
                      <div className="d-flex flex-column w-100">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Medicine name"
                            value={med.medicineName}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                const copy = [...prev.Medicines];
                                copy[i].medicineName = val;
                                return { ...prev, Medicines: copy };
                                });
                            }}
                            />
                        {/* {filteredMedicines.length > 0 && (
                          <div className="list-group w-100 mt-1">
                            {filteredMedicines.map((m) => (
                              <button
                                type="button"
                                key={m.medicineId}
                                className="list-group-item list-group-item-action"
                                onClick={() => {
                                  handleMedicineChange(i, "medicineId", m.medicineId);
                                  setMedicineSearch(
                                    `${m.medicineName} | Exp: ${formatDateDMY(m.expiryDate)}`
                                  );
                                  setFilteredMedicines([]);
                                }}
                              >
                                {m.medicineName} | Exp: {formatDateDMY(m.expiryDate)} | Qty: {m.quantity}
                              </button>
                            ))}
                          </div>
                        )} */}
                      </div>

                      <input
                        type="number"
                        className="form-control"
                        value={med.quantity}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                                const copy = [...prev.Medicines];
                                copy[i].quantity = val;
                                return { ...prev, Medicines: copy };
                            });
                            }}
                        placeholder="Qty"
                        required
                      />

                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeMedicine(i)}
                      >
                        ✕
                      </button>
                    </div>
                    {/* {medicineErrors[i] && (
                    <div
                      className={`fw-bold mt-1 ${
                        medicineErrors[i].startsWith("⚠️")
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {medicineErrors[i]}
                    </div>
                  )} */}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary mt-2"
                  onClick={addMedicine}
                >
                  + Add Medicine
                </button>

                <div className="mt-3">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.Notes}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, Notes: e.target.value }))
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100 mt-4"
                //   disabled={Object.values(medicineErrors).some(
                //     (msg) => msg.startsWith("❌")
                //   )}
                >
                  Submit Prescription
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* EMPLOYEE CARD */}
        {employeeProfile && (
          <div className="col-lg-3 d-none d-lg-block">
            <div
              className="card shadow-sm border-0 text-center p-4 sticky-top"
              style={{ top: "90px" }}
            >
              <img
                src={`http://localhost:${BACKEND_PORT}${employeeProfile.Photo}`}
                alt="Employee"
                className="rounded-circle mx-auto mb-3"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  border: "2px solid #ddd"
                }}
              />
              <h6 className="fw-bold mb-1">{employeeProfile.Name}</h6>
              <div className="text-muted">
                ABS No: {employeeProfile.ABS_NO}
              </div>
            </div>
          </div>
        )}




{lastTwoVisits.length > 0 && (
  <div className="mt-4">
    <h6 className="fw-bold">Previous 2 Prescriptions</h6>

    {lastTwoVisits.map((p, idx) => (
      <div key={idx} className="card mb-3 border-secondary">
        <div className="card-header bg-light fw-semibold">
          Date: {formatDateDMY(p.createdAt)}
        </div>

        <div className="card-body">
          {p.FamilyMember && (
            <div className="text-muted mb-2">
              Family Member: {p.FamilyMember.Name} ({p.FamilyMember.Relationship})
            </div>
          )}

          <ul className="mb-2">
            {p.Medicines.map((m, i) => (
              <li key={i}>
                {m.Medicine_Name || m.Medicine_ID?.Medicine_Name} — Qty: {m.Quantity}
              </li>
            ))}
          </ul>

          {p.Notes && (
            <div className="fst-italic text-muted">
              Notes: {p.Notes}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
)}


      </div>
    </div>
  );
};

export default DoctorPrescriptionForm;
