const mongoose = require("mongoose");

const WorkflowSchema = new mongoose.Schema({
  name: String,
  version: Number,
  is_active: Boolean,
  input_schema: Object,
  start_step_id: String
}, { timestamps: true });

module.exports = mongoose.model("Workflow", WorkflowSchema);