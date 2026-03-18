const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Workflow = require("./models/Workflow");
const Step = require("./models/Step");
const Rule = require("./models/Rule");
const Execution = require("./models/Execution");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/workflow")
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" DB Error:", err));

app.get("/", (req, res) => {
  res.send("Workflow Engine Running");
});

app.post("/workflow", async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/workflow", async (req, res) => {
  const workflows = await Workflow.find();
  res.json(workflows);
});

app.get("/add", async (req, res) => {
  const data = new Workflow({
    name: "Test Workflow",
    version: 1,
    is_active: true,
    input_schema: {},
    start_step_id: "step1"
  });

  await data.save();
  res.send("Workflow Added");
});

app.post("/step", async (req, res) => {
  try {
    const step = new Step(req.body);
    await step.save();
    res.json(step);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/step", async (req, res) => {
  const steps = await Step.find();
  res.json(steps);
});

app.get("/addstep", async (req, res) => {
  const data = new Step({
    workflow_id: "test123",
    step_id: "step1",
    type: "start",
    next_steps: []
  });

  await data.save();
  res.send("Step Added");
});

app.post("/rule", async (req, res) => {
  try {
    console.log(" DATA RECEIVED:", req.body); // DEBUG

    const { step_id, condition, next_step } = req.body;

    if (!step_id || !condition || !next_step) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const rule = new Rule({
      step_id: step_id.trim(),
      condition: condition.trim().toLowerCase(), 
      next_step: next_step.trim()
    });

    await rule.save();

    console.log(" SAVED SUCCESS"); 

    res.json(rule);
  } catch (error) {
    console.log(" ERROR:", error);
    res.status(500).send(error);
  }
});

app.get("/rule", async (req, res) => {
  const rules = await Rule.find();
  res.json(rules);
});

app.get("/addrule", async (req, res) => {
  const data = new Rule({
    step_id: "step1",
    condition: "approved",
    next_step: "step2"
  });

  await data.save();
  res.send("Rule Added");
});

app.get("/clearrule", async (req, res) => {
  await Rule.deleteMany({});
  res.send("All rules deleted");
});

app.put("/rule/:id", async (req, res) => {
  try {
    const { condition, next_step } = req.body;

    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      {
        condition: condition.trim().toLowerCase(),
        next_step: next_step.trim()
      },
      { new: true }
    );

    res.json(rule);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete("/rule/:id", async (req, res) => {
  try {
    await Rule.findByIdAndDelete(req.params.id);
    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/execute", async (req, res) => {
  try {
    const step_id = req.query.step_id;
    const input = req.query.input?.trim().toLowerCase();

    const rule = await Rule.findOne({
      step_id: step_id,
      condition: input
    });

    let nextStep = null;
    if (rule) nextStep = rule.next_step;

    res.json({
      current_step: step_id,
      input: input,
      next_step: nextStep
    });

  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/run", async (req, res) => {
  try {
    let currentStep = req.query.step_id?.trim();
    let input = req.query.input?.trim().toLowerCase();

    let path = [];

    while (currentStep) {
      path.push(currentStep);

      console.log(" Checking:", currentStep, input); // DEBUG

      const rule = await Rule.findOne({
        step_id: currentStep,
        condition: input
      });

      if (!rule) {
        console.log(" No rule found");
        break;
      }

      console.log(" Next step:", rule.next_step);

      currentStep = rule.next_step;
    }

    const execution = new Execution({
      workflow_id: "test123",
      path: path,
      input: input,
      status: "completed"
    });

    await execution.save();

    res.json({
      workflow_path: path
    });

  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/execution", async (req, res) => {
  const data = await Execution.find();
  res.json(data);
});

app.listen(5000, () => {
  console.log(" Server running on port 5000");
});
