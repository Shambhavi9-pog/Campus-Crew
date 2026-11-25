import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DAYS,
  TIME_SLOTS,
  INITIAL_RESOURCES,
  SECTIONS,
  EXTERNAL_OCCUPANCY,
  INITIAL_TIMETABLE
} from './data/seedData.js';
import {
  evaluateSystemState,
  generateReschedulePlan
} from './engine/simulationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function createInitialStore() {
  const failedResourceIds = ['MAIN_POWER'];
  const disruptionWindow = { day: 'Monday', slot: '10:00 - 11:00' };
  const evaluation = evaluateSystemState({
    resources: INITIAL_RESOURCES,
    failedResourceIds,
    timetable: INITIAL_TIMETABLE,
    day: disruptionWindow.day,
    slot: disruptionWindow.slot
  });
  const plan = generateReschedulePlan({
    evaluation,
    baseTimetable: INITIAL_TIMETABLE,
    externalOccupancy: EXTERNAL_OCCUPANCY
  });

  return {
    college: 'UBDT College',
    platform: 'CAMPUS CREW',
    isSimulatedData: true,
    days: DAYS,
    timeSlots: TIME_SLOTS,
    sections: SECTIONS,
    externalOccupancy: EXTERNAL_OCCUPANCY,
    resources: INITIAL_RESOURCES,
    originalTimetable: INITIAL_TIMETABLE,
    revisedTimetable: structuredClone(INITIAL_TIMETABLE),
    failedResourceIds,
    disruptionWindow,
    proposals: plan.proposals,
    appliedChanges: [],
    recoveryStatus: 'Disrupted - Action Required',
    auditLog: [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'simulation',
        message: 'Preloaded Demo Scenario: Main Power Supply failure at Monday 10:00 - 11:00.'
      }
    ]
  };
}

function loadStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function buildStatePayload(store) {
  const evaluation = evaluateSystemState({
    resources: store.resources,
    failedResourceIds: store.failedResourceIds,
    timetable: store.originalTimetable,
    day: store.disruptionWindow.day,
    slot: store.disruptionWindow.slot
  });

  const pendingCount = store.proposals.filter((p) => p.status === 'pending').length;
  const approvedCount = store.proposals.filter((p) => p.status === 'approved').length;

  return {
    college: store.college,
    platform: store.platform,
    isSimulatedData: store.isSimulatedData,
    days: store.days,
    timeSlots: store.timeSlots,
    sections: store.sections,
    externalOccupancy: store.externalOccupancy,
    failedResourceIds: store.failedResourceIds,
    disruptionWindow: store.disruptionWindow,
    originalTimetable: store.originalTimetable,
    revisedTimetable: store.revisedTimetable,
    proposals: store.proposals,
    appliedChanges: store.appliedChanges,
    recoveryStatus: store.recoveryStatus,
    pendingChangesCount: pendingCount + approvedCount,
    auditLog: store.auditLog.slice(0, 25),
    evaluation
  };
}

// GET full platform state
app.get('/api/state', (req, res) => {
  const store = loadStore();
  res.json(buildStatePayload(store));
});

// POST simulate failure
app.post('/api/simulate', (req, res) => {
  const store = loadStore();
  const { failedResourceIds = ['MAIN_POWER'], day = 'Monday', slot = '10:00 - 11:00', scenarioName } = req.body;

  store.failedResourceIds = [...new Set(failedResourceIds)];
  store.disruptionWindow = { day, slot };

  const evaluation = evaluateSystemState({
    resources: store.resources,
    failedResourceIds: store.failedResourceIds,
    timetable: store.originalTimetable,
    day,
    slot
  });

  const plan = generateReschedulePlan({
    evaluation,
    baseTimetable: store.originalTimetable,
    externalOccupancy: store.externalOccupancy
  });

  store.proposals = plan.proposals;
  store.recoveryStatus =
    store.failedResourceIds.length === 0
      ? 'Operational'
      : evaluation.interruptedClasses.length > 0
      ? 'Disrupted - Rescheduling Required'
      : 'Degraded - Protected by Backup';

  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'simulation',
    message: `${scenarioName || 'Failure Simulation'}: [${store.failedResourceIds.join(', ')}] at ${day} ${slot}. ${evaluation.interruptedClasses.length} class(es) interrupted.`
  });

  saveStore(store);
  res.json(buildStatePayload(store));
});

// POST restore system
app.post('/api/restore', (req, res) => {
  const store = loadStore();
  const { resetTimetable = false } = req.body || {};

  store.failedResourceIds = [];
  store.proposals = [];
  if (resetTimetable) {
    store.revisedTimetable = structuredClone(store.originalTimetable);
    store.appliedChanges = [];
  }
  store.recoveryStatus = 'Operational (System Restored)';

  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'restore',
    message: resetTimetable
      ? 'System restored and revised timetable reset to original baseline.'
      : 'Infrastructure power & systems restored to normal operational state.'
  });

  saveStore(store);
  res.json(buildStatePayload(store));
});

// POST reset to preloaded demo scenario
app.post('/api/reset-demo', (req, res) => {
  const fresh = createInitialStore();
  saveStore(fresh);
  res.json(buildStatePayload(fresh));
});

// POST update proposal status (approve / reject)
app.post('/api/proposals/:id/decision', (req, res) => {
  const store = loadStore();
  const { id } = req.params;
  const { decision } = req.body; // 'approved' | 'rejected' | 'pending'

  const proposal = store.proposals.find((p) => p.id === id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }
  if (!proposal.resolvable && decision === 'approved') {
    return res.status(400).json({ error: 'Cannot approve unresolvable proposal' });
  }

  proposal.status = decision;
  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'decision',
    message: `Proposal ${id} (${proposal.section} ${proposal.subject}) marked as ${decision.toUpperCase()}.`
  });

  saveStore(store);
  res.json(buildStatePayload(store));
});

// POST apply all approved changes to revisedTimetable (never modifies originalTimetable!)
app.post('/api/proposals/apply', (req, res) => {
  const store = loadStore();
  const approved = store.proposals.filter((p) => p.status === 'approved' && p.resolvable);

  if (approved.length === 0) {
    return res.status(400).json({ error: 'No approved proposals to apply.' });
  }

  for (const prop of approved) {
    const idx = store.revisedTimetable.findIndex((e) => e.id === prop.classId);
    if (idx !== -1) {
      store.revisedTimetable[idx] = {
        ...store.revisedTimetable[idx],
        day: prop.proposedDay,
        slot: prop.proposedSlot,
        roomId: prop.proposedRoomId,
        isRescheduled: true,
        rescheduleReason: prop.reason,
        originalDay: prop.originalDay,
        originalSlot: prop.originalSlot,
        originalRoomId: prop.originalRoomId
      };
    }
    prop.status = 'applied';
    store.appliedChanges.unshift({
      ...prop,
      appliedAt: new Date().toISOString()
    });
  }

  store.recoveryStatus = 'Recovered - Revised Timetable Active';
  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'apply',
    message: `Applied ${approved.length} approved timetable change(s) to Revised Timetable. Original timetable preserved.`
  });

  saveStore(store);
  res.json(buildStatePayload(store));
});

// PUT edit an entry in the editable original timetable
app.put('/api/timetable/:id', (req, res) => {
  const store = loadStore();
  const { id } = req.params;
  const updates = req.body;

  const origIdx = store.originalTimetable.findIndex((e) => e.id === id);
  if (origIdx === -1) {
    return res.status(404).json({ error: 'Timetable entry not found' });
  }

  store.originalTimetable[origIdx] = {
    ...store.originalTimetable[origIdx],
    ...updates
  };

  // Sync revisedTimetable entry if not already rescheduled
  const revIdx = store.revisedTimetable.findIndex((e) => e.id === id && !e.isRescheduled);
  if (revIdx !== -1) {
    store.revisedTimetable[revIdx] = {
      ...store.revisedTimetable[revIdx],
      ...updates
    };
  }

  // Re-evaluate proposals if disruption is active
  if (store.failedResourceIds.length > 0) {
    const evaluation = evaluateSystemState({
      resources: store.resources,
      failedResourceIds: store.failedResourceIds,
      timetable: store.originalTimetable,
      day: store.disruptionWindow.day,
      slot: store.disruptionWindow.slot
    });
    const plan = generateReschedulePlan({
      evaluation,
      baseTimetable: store.originalTimetable,
      externalOccupancy: store.externalOccupancy
    });
    store.proposals = plan.proposals;
  }

  store.auditLog.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'edit',
    message: `Updated timetable entry ${id} (${store.originalTimetable[origIdx].subject}).`
  });

  saveStore(store);
  res.json(buildStatePayload(store));
});

app.listen(PORT, () => {
  loadStore();
  console.log(`CAMPUS CREW Backend running at http://localhost:${PORT}`);
});
