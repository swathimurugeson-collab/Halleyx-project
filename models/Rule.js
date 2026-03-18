const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  step_id: String,
  condition: String,
  next_step_id: String,
  priority: Number
}, { timestamps: true });

module.exports = mongoose.model("Rule", RuleSchema);