const mongoose = require("mongoose");

const ExecutionSchema = new mongoose.Schema({
  workflow_id: String,
  workflow_version: Number,
  status: String,
  data: Object,
  logs: Array,
  current_step_id: String,
  retries: Number,
  triggered_by: String
}, { timestamps: true });

module.exports = mongoose.model("Execution", ExecutionSchema);