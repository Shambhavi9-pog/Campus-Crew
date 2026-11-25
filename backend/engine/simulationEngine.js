import { DAYS, TIME_SLOTS, SECTIONS } from '../data/seedData.js';

/**
 * Evaluates resource statuses, backup protection, cascade chains, and interrupted classes
 * for a given set of failed resource IDs and disruption window (day, slot).
 */
export function evaluateSystemState({
  resources,
  failedResourceIds = [],
  timetable = [],
  day = 'Monday',
  slot = '10:00 - 11:00'
}) {
  const directSet = new Set(failedResourceIds);
  const statusMap = {};
  const reasonMap = {};

  // Step 1: Evaluate base power & backup nodes first
  for (const res of resources) {
    if (directSet.has(res.id)) {
      statusMap[res.id] = 'failed';
      reasonMap[res.id] = 'Direct failure simulated by administrator';
    } else {
      statusMap[res.id] = 'operational';
      reasonMap[res.id] = 'Operating normally on primary feed';
    }
  }

  // Helper to check if a backup resource is operational
  const isBackupOnline = (backupId) => !directSet.has(backupId);

  // Step 2: Propagate failures through dependency graph (topological passes)
  // Order: power/backup -> distribution -> block -> rooms/facilities
  for (let pass = 0; pass < 4; pass++) {
    for (const res of resources) {
      if (directSet.has(res.id)) continue;

      const deps = res.dependsOn || [];
      if (deps.length === 0) continue;

      const failedDeps = deps.filter((d) => statusMap[d] === 'failed');
      const affectedDeps = deps.filter((d) => statusMap[d] === 'affected');

      if (failedDeps.length > 0) {
        // Check if resource has an operational backup
        const activeBackups = (res.protectedBy || []).filter((bId) => {
          // If backup is UPS_01, it needs either MAIN_POWER or GEN_01 to sustain long term,
          // but if UPS_01 itself isn't failed, it provides short-term protection.
          return isBackupOnline(bId) && statusMap[bId] !== 'failed';
        });

        if (activeBackups.length > 0) {
          statusMap[res.id] = 'protected';
          const backupNames = activeBackups
            .map((id) => resources.find((r) => r.id === id)?.name || id)
            .join(' + ');
          reasonMap[res.id] = `Primary feed lost (${failedDeps.join(', ')}); protected by ${backupNames}`;
        } else {
          statusMap[res.id] = 'failed';
          reasonMap[res.id] = `Cascade failure from ${failedDeps.join(', ')} (no active backup)`;
        }
      } else if (affectedDeps.length > 0) {
        statusMap[res.id] = 'affected';
        reasonMap[res.id] = `Degraded upstream dependency (${affectedDeps.join(', ')})`;
      }
    }
  }

  // Build enriched resource list
  const evaluatedResources = resources.map((res) => ({
    ...res,
    status: statusMap[res.id],
    statusReason: reasonMap[res.id]
  }));

  // Step 3: Identify ongoing classes at (day, slot)
  const ongoingClasses = timetable.filter((c) => c.day === day && c.slot === slot);
  const interruptedClasses = [];
  const protectedClasses = [];
  const unaffectedClasses = [];

  for (const cls of ongoingClasses) {
    const roomStatus = statusMap[cls.roomId];
    const room = resources.find((r) => r.id === cls.roomId);
    if (roomStatus === 'failed') {
      interruptedClasses.push({
        ...cls,
        roomName: room?.name || cls.roomId,
        roomStatus,
        interruptionReason: reasonMap[cls.roomId]
      });
    } else if (roomStatus === 'protected') {
      protectedClasses.push({
        ...cls,
        roomName: room?.name || cls.roomId,
        roomStatus,
        protectionNote: reasonMap[cls.roomId]
      });
    } else {
      unaffectedClasses.push({
        ...cls,
        roomName: room?.name || cls.roomId,
        roomStatus
      });
    }
  }

  // Step 4: Build cascade chains for visualization & reporting
  const cascadeChains = [];
  for (const cls of interruptedClasses) {
    const room = resources.find((r) => r.id === cls.roomId);
    const chain = [];

    // Trace upstream root cause
    const traceRoot = (resId, visited = new Set()) => {
      if (visited.has(resId)) return;
      visited.add(resId);
      const r = resources.find((x) => x.id === resId);
      if (!r) return;
      if (directSet.has(resId)) {
        chain.push({ id: r.id, label: r.name, status: 'failed', type: 'resource' });
        return;
      }
      for (const depId of r.dependsOn || []) {
        if (statusMap[depId] === 'failed') {
          traceRoot(depId, visited);
          break;
        }
      }
      chain.push({ id: r.id, label: r.name, status: statusMap[r.id], type: 'resource' });
    };

    traceRoot(cls.roomId);
    chain.push({
      id: cls.id,
      label: `${cls.section} ${cls.subject}`,
      status: 'failed',
      type: 'class'
    });
    chain.push({
      id: `FAC-${cls.id}`,
      label: `${cls.faculty} & ${cls.students} Students`,
      status: 'affected',
      type: 'people'
    });
    chain.push({
      id: `DIS-${cls.id}`,
      label: 'Academic Schedule Disruption',
      status: 'affected',
      type: 'impact'
    });

    cascadeChains.push({
      classId: cls.id,
      section: cls.section,
      subject: cls.subject,
      roomName: room?.name || cls.roomId,
      steps: chain
    });
  }

  const directlyAffected = evaluatedResources.filter((r) => directSet.has(r.id));
  const indirectlyAffected = evaluatedResources.filter(
    (r) => !directSet.has(r.id) && (r.status === 'failed' || r.status === 'affected')
  );
  const protectedResources = evaluatedResources.filter((r) => r.status === 'protected');
  const operationalResources = evaluatedResources.filter((r) => r.status === 'operational');
  const failedResources = evaluatedResources.filter((r) => r.status === 'failed');

  const affectedFaculty = [...new Set(interruptedClasses.map((c) => c.faculty))];
  const affectedStudents = interruptedClasses.reduce((sum, c) => sum + (c.students || 60), 0);

  const availableLabs = evaluatedResources.filter(
    (r) => r.type === 'lab' && (r.status === 'operational' || r.status === 'protected')
  );

  // Operational risks
  const operationalRisks = [];
  if (statusMap['MAIN_POWER'] === 'failed') {
    operationalRisks.push({
      severity: 'high',
      title: 'Primary Grid Outage',
      detail: '11 kV BESCOM feed offline. Block A has zero backup coverage.'
    });
  }
  if (statusMap['MAIN_POWER'] === 'failed' && statusMap['GEN_01'] === 'failed') {
    operationalRisks.push({
      severity: 'critical',
      title: 'Total Campus Blackout Risk',
      detail: 'Both Main Power and 250 kVA Generator are offline. Central Server Room relying solely on finite UPS battery.'
    });
  }
  if (interruptedClasses.length > 0) {
    operationalRisks.push({
      severity: 'high',
      title: 'Laboratory Curriculum Disruption',
      detail: `${interruptedClasses.length} ongoing session(s) interrupted affecting ${affectedStudents} students.`
    });
  }
  if (statusMap['LAB_01'] === 'failed') {
    operationalRisks.push({
      severity: 'medium',
      title: 'Single Point of Failure in Block A',
      detail: 'Computer Lab 01 lacks generator transfer switch coverage.'
    });
  }

  return {
    disruptionWindow: { day, slot },
    resources: evaluatedResources,
    summary: {
      totalResources: evaluatedResources.length,
      mainPowerStatus: statusMap['MAIN_POWER'],
      generatorStatus: statusMap['GEN_01'],
      upsStatus: statusMap['UPS_01'],
      operationalCount: operationalResources.length,
      protectedCount: protectedResources.length,
      failedCount: failedResources.length,
      affectedClassesCount: interruptedClasses.length,
      affectedStudentsCount: affectedStudents,
      availableLabsCount: availableLabs.length
    },
    directlyAffected,
    indirectlyAffected,
    protectedResources,
    ongoingClasses,
    interruptedClasses,
    protectedClasses,
    unaffectedClasses,
    affectedFaculty,
    affectedStudents,
    cascadeChains,
    operationalRisks
  };
}

/**
 * Rule-based constraint checking scheduler.
 * Generates alternative room/time recommendations for interrupted classes.
 */
export function generateReschedulePlan({
  evaluation,
  baseTimetable,
  externalOccupancy = []
}) {
  const { interruptedClasses, resources, disruptionWindow } = evaluation;
  if (interruptedClasses.length === 0) {
    return {
      proposals: [],
      hasUnresolvable: false,
      message: 'All scheduled classes are operational or protected by backup.'
    };
  }

  const proposals = [];
  // Track tentative allocations so two interrupted classes don't collide with each other
  const tentativeBookings = [];

  const dayStartIdx = Math.max(0, DAYS.indexOf(disruptionWindow.day));
  const slotStartIdx = Math.max(0, TIME_SLOTS.indexOf(disruptionWindow.slot));

  // Build ordered candidate (day, slot) pairs starting from disruption day & slot
  const candidateWindows = [];
  for (let d = dayStartIdx; d < DAYS.length; d++) {
    const startS = d === dayStartIdx ? slotStartIdx : 0;
    for (let s = startS; s < TIME_SLOTS.length; s++) {
      candidateWindows.push({ day: DAYS[d], slot: TIME_SLOTS[s] });
    }
  }

  for (const cls of interruptedClasses) {
    const originalRoom = resources.find((r) => r.id === cls.roomId);
    const requiredType = cls.isPractical ? 'lab' : 'classroom';

    // Candidate rooms matching type & capacity
    const suitableRooms = resources.filter((r) => {
      if (cls.isPractical) return r.type === 'lab';
      return r.type === 'classroom' || r.type === 'lab';
    });

    const poweredSuitableRooms = suitableRooms.filter(
      (r) => (r.status === 'operational' || r.status === 'protected') && r.capacity >= cls.students
    );

    let chosen = null;
    const rejectionLog = [];

    if (poweredSuitableRooms.length > 0) {
      for (const win of candidateWindows) {
        // Skip the exact failed slot if room is same, or check all powered rooms
        // Check section availability at (win.day, win.slot)
        const sectionBusy =
          baseTimetable.some(
            (e) =>
              e.id !== cls.id &&
              e.section === cls.section &&
              e.day === win.day &&
              e.slot === win.slot
          ) ||
          tentativeBookings.some(
            (b) => b.section === cls.section && b.day === win.day && b.slot === win.slot
          );

        if (sectionBusy) {
          if (win.day === disruptionWindow.day) {
            rejectionLog.push(`${win.day} ${win.slot}: ${cls.section} already has a scheduled class`);
          }
          continue;
        }

        // Check faculty availability at (win.day, win.slot)
        const facultyBusy =
          baseTimetable.some(
            (e) =>
              e.id !== cls.id &&
              e.faculty === cls.faculty &&
              e.day === win.day &&
              e.slot === win.slot
          ) ||
          tentativeBookings.some(
            (b) => b.faculty === cls.faculty && b.day === win.day && b.slot === win.slot
          );

        if (facultyBusy) {
          if (win.day === disruptionWindow.day) {
            rejectionLog.push(`${win.day} ${win.slot}: ${cls.faculty} is teaching another class`);
          }
          continue;
        }

        // Check each powered suitable room
        for (const room of poweredSuitableRooms) {
          const roomBusyInTimetable = baseTimetable.some(
            (e) =>
              e.id !== cls.id &&
              e.roomId === room.id &&
              e.day === win.day &&
              e.slot === win.slot
          );
          const roomBusyExternal = externalOccupancy.some(
            (ext) => ext.roomId === room.id && ext.day === win.day && ext.slot === win.slot
          );
          const roomBusyTentative = tentativeBookings.some(
            (b) => b.roomId === room.id && b.day === win.day && b.slot === win.slot
          );

          if (roomBusyInTimetable || roomBusyExternal || roomBusyTentative) {
            const extMatch = externalOccupancy.find(
              (ext) => ext.roomId === room.id && ext.day === win.day && ext.slot === win.slot
            );
            if (win.day === disruptionWindow.day) {
              rejectionLog.push(
                `${win.day} ${win.slot} (${room.name}): Occupied${extMatch ? ` by ${extMatch.label}` : ''}`
              );
            }
            continue;
          }

          // All constraints satisfied!
          chosen = {
            room,
            day: win.day,
            slot: win.slot
          };
          break;
        }

        if (chosen) break;
      }
    }

    if (chosen) {
      tentativeBookings.push({
        section: cls.section,
        faculty: cls.faculty,
        roomId: chosen.room.id,
        day: chosen.day,
        slot: chosen.slot
      });

      const powerNote =
        chosen.room.status === 'protected'
          ? `Backup-protected (${chosen.room.protectedBy.join(' + ')})`
          : 'Operational on primary power';

      proposals.push({
        id: `CHG-${cls.id}`,
        classId: cls.id,
        status: 'pending', // pending | approved | rejected
        resolvable: true,
        section: cls.section,
        subject: cls.subject,
        faculty: cls.faculty,
        students: cls.students,
        isPractical: cls.isPractical,
        originalDay: cls.day,
        originalSlot: cls.slot,
        originalRoomId: cls.roomId,
        originalRoomName: originalRoom?.name || cls.roomId,
        proposedDay: chosen.day,
        proposedSlot: chosen.slot,
        proposedRoomId: chosen.room.id,
        proposedRoomName: chosen.room.name,
        reason: `${originalRoom?.name || cls.roomId} offline (${cls.interruptionReason}). Moved to ${chosen.room.name} (${powerNote}) at ${chosen.day} ${chosen.slot}.`,
        constraintsChecked: [
          { label: 'Room Powered / Backup-Protected', passed: true, detail: powerNote },
          { label: 'Room Capacity Sufficient', passed: true, detail: `${chosen.room.capacity} >= ${cls.students} students` },
          { label: 'Suitable Room Type', passed: true, detail: cls.isPractical ? 'Computer Laboratory' : 'Classroom' },
          { label: 'No Room Conflict', passed: true, detail: `${chosen.room.name} free at ${chosen.slot}` },
          { label: 'Faculty Available', passed: true, detail: `${cls.faculty} free at ${chosen.slot}` },
          { label: 'Section Available', passed: true, detail: `${cls.section} has no overlap at ${chosen.slot}` }
        ],
        rejectionLog: rejectionLog.slice(0, 4)
      });
    } else {
      // No suitable powered room / slot found!
      const roomDiagnostics = suitableRooms.map((r) => {
        if (r.status === 'failed') return `${r.name}: Failed (${r.statusReason})`;
        if (r.capacity < cls.students) return `${r.name}: Insufficient capacity (${r.capacity} < ${cls.students})`;
        return `${r.name}: No conflict-free slot available`;
      });

      // Find next feasible slot assuming power is restored on next available day
      let nextFeasible = 'Tuesday 11:00 - 12:00 in Computer Lab 01 (once power is restored)';
      for (let d = Math.min(dayStartIdx + 1, DAYS.length - 1); d < DAYS.length; d++) {
        for (const s of TIME_SLOTS) {
          const secFree = !baseTimetable.some(
            (e) => e.section === cls.section && e.day === DAYS[d] && e.slot === s
          );
          const facFree = !baseTimetable.some(
            (e) => e.faculty === cls.faculty && e.day === DAYS[d] && e.slot === s
          );
          const labFree = suitableRooms.find(
            (r) =>
              r.capacity >= cls.students &&
              !baseTimetable.some((e) => e.roomId === r.id && e.day === DAYS[d] && e.slot === s) &&
              !externalOccupancy.some((ext) => ext.roomId === r.id && ext.day === DAYS[d] && ext.slot === s)
          );
          if (secFree && facFree && labFree) {
            nextFeasible = `${DAYS[d]} ${s} in ${labFree.name} (pending power/generator restoration)`;
            break;
          }
        }
        if (nextFeasible.includes('pending')) break;
      }

      proposals.push({
        id: `CHG-${cls.id}`,
        classId: cls.id,
        status: 'unresolvable',
        resolvable: false,
        section: cls.section,
        subject: cls.subject,
        faculty: cls.faculty,
        students: cls.students,
        isPractical: cls.isPractical,
        originalDay: cls.day,
        originalSlot: cls.slot,
        originalRoomId: cls.roomId,
        originalRoomName: originalRoom?.name || cls.roomId,
        proposedDay: null,
        proposedSlot: null,
        proposedRoomId: null,
        proposedRoomName: 'None Available',
        reason: `No suitable powered ${requiredType} is available. ${roomDiagnostics.join('; ')}.`,
        nextFeasibleSuggestion: nextFeasible,
        constraintsChecked: [
          { label: 'Room Powered / Backup-Protected', passed: false, detail: '0 powered laboratories available' },
          { label: 'Suitable Room Type', passed: false, detail: cls.isPractical ? 'Practical requires powered Computer Lab' : 'Classroom required' }
        ],
        rejectionLog: roomDiagnostics
      });
    }
  }

  return {
    proposals,
    hasUnresolvable: proposals.some((p) => !p.resolvable),
    message: proposals.some((p) => !p.resolvable)
      ? 'One or more interrupted classes could not be rescheduled due to insufficient powered laboratories.'
      : `Generated ${proposals.length} conflict-free rescheduling recommendation(s).`
  };
}
