const express = require("express");
const mongoose = require("mongoose");
const diseaseApp = express.Router();

const Disease = require("../models/disease");

const DiseaseType = require("../models/disease_type");

// =======================================================
// GET ALL DISEASES FOR AN EMPLOYEE (SELF + FAMILY)
// =======================================================
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


module.exports = diseaseApp;
