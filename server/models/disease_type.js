const mongoose = require("mongoose");

const DiseaseTypeSchema = new mongoose.Schema(
  {
    Category: {
      type: String,
      enum: ["Communicable", "Non-Communicable"],
      required: true,
    },
    Disease_Name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiseaseType", DiseaseTypeSchema);
