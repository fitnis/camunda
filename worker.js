// worker.mjs
import { Client, logger, Variables } from "camunda-external-task-client-js";
import axios from "axios";

// 1) Camunda client configuration
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };
const client = new Client(config);

// 2) Base URL for your API (as defined in openapi.yml)
const API = "http://localhost:3000/api";

/**
 * 1) Register Patient
 *    POST /patients/register
 *    :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
 */
client.subscribe("createOrLookupPatient", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    if (vars.patientId) {
      // Existing patient: just pass the ID through
      outVars.set("patientId", vars.patientId);
    } else {
      // New patient: register at clinic
      await axios.post(`${API}/patients/register`, {
        name: vars.name,
        dob: vars.dob,
        reason: vars.reason,
      });
      // No ID returned in spec—assume upstream populates patientId in the form
    }
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 2) Perform Exam
 *    POST /records/exam
 *    :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
 */
client.subscribe("createExamination", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    await axios.post(`${API}/records/exam`, {
      patientId: vars.patientId,
      examType: vars.examType,
    });
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 3) Record Exam Results
 *    POST /records/exam/results
 *    :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}
 */
client.subscribe("recordExamResults", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    await axios.post(`${API}/records/exam/results`, {
      patientId: vars.patientId,
      result: vars.examResult,
    });
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 4) Collect Sample
 *    POST /lab/collectSample
 *    :contentReference[oaicite:6]{index=6}
 */
client.subscribe("collectSample", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    const resp = await axios.post(`${API}/lab/collectSample`, {
      sampleId: vars.sampleId,
      patientId: vars.patientId,
      type: vars.sampleType,
    });
    outVars.set("collectedSample", resp.data);
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 5) Record Sample
 *    POST /lab/recordSample
 *    :contentReference[oaicite:7]{index=7}:contentReference[oaicite:8]{index=8}
 */
client.subscribe("recordSample", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    await axios.post(`${API}/lab/recordSample`, {
      sampleId: vars.sampleId,
      patientId: vars.patientId,
      type: vars.sampleType,
    });
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 6) Process Sample
 *    POST /lab/processSample
 *    :contentReference[oaicite:9]{index=9}:contentReference[oaicite:10]{index=10}
 */
client.subscribe("processSample", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    await axios.post(`${API}/lab/processSample`, {
      sampleId: vars.sampleId,
      patientId: vars.patientId,
      type: vars.sampleType,
    });
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 7) Evaluate Sample
 *    POST /lab/evaluateSample
 *    :contentReference[oaicite:11]{index=11}:contentReference[oaicite:12]{index=12}
 */
client.subscribe("evaluateSample", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    await axios.post(`${API}/lab/evaluateSample`, {
      sampleId: vars.sampleId,
      result: vars.sampleResult,
    });
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 8) Prescribe Medication
 *    POST /prescriptions/prescribe
 *    :contentReference[oaicite:13]{index=13}:contentReference[oaicite:14]{index=14}
 */
client.subscribe("prescribeMedication", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    const resp = await axios.post(`${API}/prescriptions/prescribe`, {
      patientId: vars.patientId,
      medication: vars.medication,
      dosage: vars.dosage,
    });
    outVars.set("prescriptionConfirmation", resp.data);
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

/**
 * 9) (Optional) Create Prescription Record
 *    POST /prescriptions
 *    :contentReference[oaicite:15]{index=15}:contentReference[oaicite:16]{index=16}
 */
client.subscribe("createPrescription", async ({ task, taskService }) => {
  const vars = task.variables.getAll();
  const outVars = new Variables();

  try {
    const resp = await axios.post(`${API}/prescriptions`, {
      patientId: vars.patientId,
      medication: vars.medication,
      dosage: vars.dosage,
    });
    outVars.set("createdPrescription", resp.data);
  } catch (e) {
    outVars.set("error", e.message);
  }

  await taskService.complete(task, outVars);
});

console.log("🚀 Camunda external‐task worker up and running");
