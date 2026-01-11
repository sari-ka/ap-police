const express = require("express");
const router = express.Router();
const DailyVisit = require("../models/daily_visit");

// REGISTER VISIT
router.post("/register", async (req, res) => {
  try {
    const { employee_id, abs_no, patient } = req.body;
    
      if (!employee_id || !abs_no || !patient) {
        return res.status(400).json({ error: "Missing fields" });
      }
      

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastVisit = await DailyVisit.findOne({ visit_date: today })
      .sort({ token_no: -1 });

    const token_no = lastVisit ? lastVisit.token_no + 1 : 1;

    const visit = await DailyVisit.create({
      employee_id,
      abs_no,
      patient,
      token_no
    });

    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET TODAY VISITS
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visits = await DailyVisit.find({ visit_date: today })
      .populate("employee_id");

    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET VISIT BY ID
router.get("/:id", async (req, res) => {
  try {
    const visit = await DailyVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET latest visit for employee
router.get("/employee/latest/:employeeId", async (req, res) => {
  const visit = await DailyVisit.findOne({
    employee_id: req.params.employeeId,
    "patient.type": "EMPLOYEE"
  }).sort({ created_at: -1 });

  res.json(visit || null);
});


// GET latest visit for family member
router.get("/family/latest/:employeeId/:familyName", async (req, res) => {
  const { employeeId, familyName } = req.params;

  const visit = await DailyVisit.findOne({
    employee_id: employeeId,
    "patient.type": "FAMILY",
    "patient.name": familyName
  }).sort({ created_at: -1 });

  res.json(visit || null);
});


module.exports = router;
