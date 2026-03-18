const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  workflow_id: String,
  name: String,
  step_type: String,
  order: Number,
  metadata: Object
}, { timestamps: true });

module.exports = mongoose.model("Step", StepSchema);