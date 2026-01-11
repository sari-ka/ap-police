// routes/diseaseRoutes.js
const express = require("express");
const mongoose = require("mongoose"); 
const diseaseApp = express.Router();
// const Disease = require("../models/disease");
const FamilyMember = require("../models/family_member");
const Employee = require("../models/employee");
const Disease = require("../models/disease");

const DiseaseType = require("../models/disease_type");

// ➕ Add a new disease record
diseaseApp.get("/fetchtype", async (req, res) => {
  try {
    const { category } = req.query;
    console.log("Category filter:", category);
    const filter = category ? { Category: category } : {};

    const diseaseTypes = await DiseaseType.find(filter)
      .select("Disease_Name Category")
      .sort({ Disease_Name: 1 });

    res.status(200).json(diseaseTypes);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch disease types",
      error: err.message,
    });
  }
});

diseaseApp.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid Employee ID" });
    }

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const diseases = await Disease.find({
      Employee_ID: employeeId,
      $or: [
        { Category: "Non-Communicable" },
        {
          Category: "Communicable",
          createdAt: { $gte: twoMonthsAgo }
        }
      ]
    })
      .populate("Employee_ID", "Name ABS_NO")
      .populate("FamilyMember_ID", "Name Relationship")
      .sort({ createdAt: -1 });

    res.status(200).json(diseases);
  } catch (err) {
    console.error("Disease fetch error:", err);
    res.status(500).json({
      message: "Failed to fetch diseases",
      error: err.message
    });
  }
});



/* =====================================================
   ADD / STORE A DISEASE TYPE
   ===================================================== */
diseaseApp.post("/store_type", async (req, res) => {
  try {
    const { Category, Disease_Name } = req.body;

    if (!Category || !Disease_Name) {
      return res.status(400).json({
        message: "Category and Disease_Name are required",
      });
    }

    const exists = await DiseaseType.findOne({
      Disease_Name: Disease_Name.trim(),
    });

    if (exists) {
      return res.status(409).json({
        message: "Disease already exists",
      });
    }

    const diseaseType = await DiseaseType.create({
      Category,
      Disease_Name: Disease_Name.trim(),
    });

    res.status(201).json(diseaseType);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create disease type",
      error: err.message,
    });
  }
});

/* =====================================================
   FETCH DISEASE TYPES
   - Optional filter by category
   ===================================================== */


// module.exports = diseaseApp;

diseaseApp.post("/diseases", async (req, res) => {
  try {
    // Step 1️⃣ — Create and save the disease record
    const newDisease = new Disease(req.body);
    const savedDisease = await newDisease.save();

    // Step 2️⃣ — If it's for a Family Member
    if (req.body.IsFamilyMember && req.body.FamilyMember_ID) {
      console.log("➡ Updating family member medical history...");

      await FamilyMember.findByIdAndUpdate(
        req.body.FamilyMember_ID,
        {
          $push: {
            Medical_History: {
              Date: new Date(),
              Disease: [savedDisease._id], // ✅ link new disease ID
              Diagnosis: req.body.Description || "",
              Medicines: (req.body.Common_Medicines || []).map((m) => ({
                Medicine_Name: m,
                Quantity: 0,
              })),
              Notes: req.body.Notes || "",
            },
          },
        },
        { new: true }
      );
    }

    // Step 3️⃣ — Otherwise, it's for the Employee themself
    else if (!req.body.IsFamilyMember && req.body.Employee_ID) {
      console.log("➡ Updating employee medical history...");

      await Employee.findByIdAndUpdate(
        req.body.Employee_ID,
        {
          $push: {
            Medical_History: {
              Date: new Date(),
              Disease: [savedDisease._id], // ✅ link new disease ID
              Diagnosis: req.body.Description || "",
              Medicines: (req.body.Common_Medicines || []).map((m) => ({
                Medicine_Name: m,
                Quantity: 0,
              })),
              Notes: req.body.Notes || "",
            },
          },
        },
        { new: true }
      );
    }

    // Step 4️⃣ — Respond to client
    res.status(201).json({
      message: "✅ Disease record added successfully",
      data: savedDisease,
    });
  } catch (err) {
    console.error("❌ Error adding disease:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all disease records
diseaseApp.get("/", async (req, res) => {
  try {
    const diseases = await Disease.find()
      .populate("Institute_ID", "Institute_Name")
      .populate("Employee_ID", "Name ABS_NO")
      .populate("FamilyMember_ID", "Name Relationship");
    res.json(diseases);
  } catch (err) {
    console.error("❌ Error fetching diseases:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Get disease by ID
diseaseApp.get("/:id", async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id)
      .populate("Institute_ID", "Institute_Name")
      .populate("Employee_ID", "Name ABS_NO")
      .populate("FamilyMember_ID", "Name Relationship");

    if (!disease)
      return res.status(404).json({ message: "Disease not found" });

    res.json(disease);
  } catch (err) {
    console.error("❌ Error fetching disease by ID:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Get diseases by category (Communicable / Non-Communicable)
diseaseApp.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const diseases = await Disease.find({ Category: category });
    res.json(diseases);
  } catch (err) {
    console.error("❌ Error fetching diseases by category:", err);
    res.status(500).json({ error: err.message });
  }
});
// const express = require("express");
// const mongoose = require("mongoose");
// const diseaseApp = express.Router();



// =======================================================
// GET ALL DISEASES FOR AN EMPLOYEE (SELF + FAMILY)
// =======================================================

module.exports = diseaseApp;
