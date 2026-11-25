// Simulated institutional data for UBDT College (CSE A & CSE B)
// NOTE: All infrastructure topologies, capacities, and schedules are simulated sample data for demonstration.

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '14:00 - 15:00',
  '15:00 - 16:00'
];

export const INITIAL_RESOURCES = [
  {
    id: 'MAIN_POWER',
    name: 'Main Power Supply',
    code: 'PWR-GRID-01',
    category: 'Electrical Supply',
    type: 'power',
    block: 'Utility Yard',
    capacity: 500,
    unit: 'kVA',
    hasBackup: false,
    dependsOn: [],
    protectedBy: [],
    mapPos: { x: 80, y: 70 },
    graphPos: { x: 400, y: 30 },
    description: 'Primary 11 kV institutional grid feed'
  },
  {
    id: 'GEN_01',
    name: 'Backup Generator (250 kVA)',
    code: 'GEN-250-01',
    category: 'Backup Power',
    type: 'backup',
    block: 'Utility Yard',
    capacity: 250,
    unit: 'kVA',
    hasBackup: true,
    dependsOn: [],
    protectedBy: [],
    mapPos: { x: 260, y: 70 },
    graphPos: { x: 700, y: 30 },
    description: 'Auto-transfer diesel generator for Block B critical circuits'
  },
  {
    id: 'UPS_01',
    name: 'Central UPS Bank (80 kVA)',
    code: 'UPS-080-01',
    category: 'Backup Power',
    type: 'backup',
    block: 'Block B',
    capacity: 80,
    unit: 'kVA',
    hasBackup: true,
    dependsOn: ['MAIN_POWER'],
    protectedBy: ['GEN_01'],
    mapPos: { x: 440, y: 70 },
    graphPos: { x: 850, y: 160 },
    description: 'Online double-conversion UPS for Server Room, Lab 02, Classroom 02'
  },
  {
    id: 'FEEDER_A',
    name: 'Block A Power Feeder',
    code: 'FDR-A-01',
    category: 'Electrical Supply',
    type: 'distribution',
    block: 'Block A',
    capacity: 200,
    unit: 'kVA',
    hasBackup: false,
    dependsOn: ['MAIN_POWER'],
    protectedBy: [],
    mapPos: { x: 140, y: 175 },
    graphPos: { x: 200, y: 160 },
    description: 'Grid-only distribution panel serving Academic Block A'
  },
  {
    id: 'FEEDER_B',
    name: 'Block B Power Feeder',
    code: 'FDR-B-01',
    category: 'Electrical Supply',
    type: 'distribution',
    block: 'Block B',
    capacity: 300,
    unit: 'kVA',
    hasBackup: true,
    dependsOn: ['MAIN_POWER'],
    protectedBy: ['GEN_01'],
    mapPos: { x: 560, y: 175 },
    graphPos: { x: 580, y: 160 },
    description: 'Dual-feed distribution panel backed by 250 kVA Generator'
  },
  {
    id: 'BLOCK_A',
    name: 'Academic Block A',
    code: 'BLK-A',
    category: 'Academic Block',
    type: 'block',
    block: 'Block A',
    capacity: 300,
    unit: 'seats',
    hasBackup: false,
    dependsOn: ['FEEDER_A'],
    protectedBy: [],
    mapPos: { x: 140, y: 260 },
    graphPos: { x: 140, y: 290 },
    description: 'CSE Ground & 1st Floor Wing (Grid-only)'
  },
  {
    id: 'BLOCK_B',
    name: 'Academic Block B',
    code: 'BLK-B',
    category: 'Academic Block',
    type: 'block',
    block: 'Block B',
    capacity: 420,
    unit: 'seats',
    hasBackup: true,
    dependsOn: ['FEEDER_B'],
    protectedBy: ['GEN_01'],
    mapPos: { x: 560, y: 260 },
    graphPos: { x: 580, y: 290 },
    description: 'Computing, Library & Core Infrastructure Wing (Generator-backed)'
  },
  {
    id: 'LAB_01',
    name: 'Computer Lab 01',
    code: 'CSE-LAB-01',
    category: 'Computer Laboratory',
    type: 'lab',
    block: 'Block A',
    capacity: 65,
    unit: 'workstations',
    hasBackup: false,
    dependsOn: ['FEEDER_A', 'BLOCK_A'],
    protectedBy: [],
    mapPos: { x: 70, y: 360 },
    graphPos: { x: 40, y: 440 },
    description: 'Data Structures & Algorithms Lab (No backup circuit)'
  },
  {
    id: 'CR_01',
    name: 'Classroom 01',
    code: 'CSE-CR-01',
    category: 'Classroom',
    type: 'classroom',
    block: 'Block A',
    capacity: 65,
    unit: 'seats',
    hasBackup: false,
    dependsOn: ['FEEDER_A', 'BLOCK_A'],
    protectedBy: [],
    mapPos: { x: 205, y: 360 },
    graphPos: { x: 210, y: 440 },
    description: 'Lecture Hall A-101 (Smartboard + Projector)'
  },
  {
    id: 'CR_03',
    name: 'Classroom 03',
    code: 'CSE-CR-03',
    category: 'Classroom',
    type: 'classroom',
    block: 'Block A',
    capacity: 65,
    unit: 'seats',
    hasBackup: false,
    dependsOn: ['FEEDER_A', 'BLOCK_A'],
    protectedBy: [],
    mapPos: { x: 340, y: 360 },
    graphPos: { x: 360, y: 440 },
    description: 'Lecture Hall A-102'
  },
  {
    id: 'LAB_02',
    name: 'Computer Lab 02',
    code: 'CSE-LAB-02',
    category: 'Computer Laboratory',
    type: 'lab',
    block: 'Block B',
    capacity: 65,
    unit: 'workstations',
    hasBackup: true,
    dependsOn: ['FEEDER_B', 'BLOCK_B'],
    protectedBy: ['GEN_01', 'UPS_01'],
    mapPos: { x: 475, y: 360 },
    graphPos: { x: 510, y: 440 },
    description: 'Systems & Programming Lab (Generator + UPS protected)'
  },
  {
    id: 'LAB_03',
    name: 'Computer Lab 03',
    code: 'CSE-LAB-03',
    category: 'Computer Laboratory',
    type: 'lab',
    block: 'Block B',
    capacity: 65,
    unit: 'workstations',
    hasBackup: true,
    dependsOn: ['FEEDER_B', 'BLOCK_B'],
    protectedBy: ['GEN_01'],
    mapPos: { x: 610, y: 360 },
    graphPos: { x: 670, y: 440 },
    description: 'Database & Networks Lab (Generator protected)'
  },
  {
    id: 'CR_02',
    name: 'Classroom 02',
    code: 'CSE-CR-02',
    category: 'Classroom',
    type: 'classroom',
    block: 'Block B',
    capacity: 65,
    unit: 'seats',
    hasBackup: true,
    dependsOn: ['FEEDER_B', 'BLOCK_B'],
    protectedBy: ['GEN_01', 'UPS_01'],
    mapPos: { x: 745, y: 360 },
    graphPos: { x: 830, y: 440 },
    description: 'Smart Lecture Hall B-201 (Generator + UPS protected)'
  },
  {
    id: 'SERVER_ROOM',
    name: 'Central Server Room',
    code: 'SRV-CORE-01',
    category: 'Core Infrastructure',
    type: 'infrastructure',
    block: 'Block B',
    capacity: 100,
    unit: '% uptime',
    hasBackup: true,
    dependsOn: ['FEEDER_B', 'BLOCK_B', 'UPS_01'],
    protectedBy: ['GEN_01', 'UPS_01'],
    mapPos: { x: 540, y: 460 },
    graphPos: { x: 740, y: 290 },
    description: 'Campus ERP, LMS & Authentication Cluster'
  },
  {
    id: 'LIBRARY',
    name: 'Central Digital Library',
    code: 'LIB-MAIN-01',
    category: 'Facility',
    type: 'facility',
    block: 'Block B',
    capacity: 120,
    unit: 'seats',
    hasBackup: true,
    dependsOn: ['FEEDER_B', 'BLOCK_B'],
    protectedBy: ['GEN_01'],
    mapPos: { x: 700, y: 460 },
    graphPos: { x: 920, y: 290 },
    description: 'Reading Hall & Digital Repository'
  }
];

export const SECTIONS = {
  'CSE A': { name: 'CSE A', students: 60, semester: '3rd Semester', department: 'Computer Science & Engineering' },
  'CSE B': { name: 'CSE B', students: 60, semester: '3rd Semester', department: 'Computer Science & Engineering' }
};

// External / shared lab reservations so 10:00 AM Monday Lab 02 & Lab 03 are realistically busy
export const EXTERNAL_OCCUPANCY = [
  {
    id: 'EXT-01',
    day: 'Monday',
    slot: '10:00 - 11:00',
    roomId: 'LAB_02',
    label: '3rd Sem IoT & Microprocessor Batch (Reserved)'
  },
  {
    id: 'EXT-02',
    day: 'Monday',
    slot: '10:00 - 11:00',
    roomId: 'LAB_03',
    label: 'ISE Section DBMS Practical (Reserved)'
  },
  {
    id: 'EXT-03',
    day: 'Monday',
    slot: '11:00 - 12:00',
    roomId: 'LAB_03',
    label: 'ISE Section DBMS Practical (Reserved)'
  }
];

export const INITIAL_TIMETABLE = [
  // ================= MONDAY =================
  {
    id: 'CSEA-MON-09',
    section: 'CSE A',
    day: 'Monday',
    slot: '09:00 - 10:00',
    subject: 'Operating Systems',
    faculty: 'Dr. Ramesh Kulkarni',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-MON-09',
    section: 'CSE B',
    day: 'Monday',
    slot: '09:00 - 10:00',
    subject: 'Discrete Mathematics',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-MON-10',
    section: 'CSE A',
    day: 'Monday',
    slot: '10:00 - 11:00',
    subject: 'Data Structures Practical',
    faculty: 'Prof. Anitha Rao',
    roomId: 'LAB_01',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEB-MON-10',
    section: 'CSE B',
    day: 'Monday',
    slot: '10:00 - 11:00',
    subject: 'Java Programming',
    faculty: 'Prof. Vikram Desai',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  // Note: CSE A has 11:00 - 12:00 free on Monday (Library/Self-Study slot) so Lab 02 at 11:00 AM is feasible!
  {
    id: 'CSEB-MON-11',
    section: 'CSE B',
    day: 'Monday',
    slot: '11:00 - 12:00',
    subject: 'Database Management Systems',
    faculty: 'Prof. Sneha Patil',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-MON-12',
    section: 'CSE A',
    day: 'Monday',
    slot: '12:00 - 13:00',
    subject: 'Computer Networks',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-MON-12',
    section: 'CSE B',
    day: 'Monday',
    slot: '12:00 - 13:00',
    subject: 'Operating Systems',
    faculty: 'Dr. Ramesh Kulkarni',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-MON-14',
    section: 'CSE A',
    day: 'Monday',
    slot: '14:00 - 15:00',
    subject: 'Java Programming',
    faculty: 'Prof. Vikram Desai',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-MON-14',
    section: 'CSE B',
    day: 'Monday',
    slot: '14:00 - 15:00',
    subject: 'Data Structures',
    faculty: 'Prof. Anitha Rao',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },

  // ================= TUESDAY =================
  {
    id: 'CSEA-TUE-09',
    section: 'CSE A',
    day: 'Tuesday',
    slot: '09:00 - 10:00',
    subject: 'Data Structures',
    faculty: 'Prof. Anitha Rao',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-TUE-09',
    section: 'CSE B',
    day: 'Tuesday',
    slot: '09:00 - 10:00',
    subject: 'Java Programming Practical',
    faculty: 'Prof. Vikram Desai',
    roomId: 'LAB_02',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEA-TUE-10',
    section: 'CSE A',
    day: 'Tuesday',
    slot: '10:00 - 11:00',
    subject: 'Database Management Systems',
    faculty: 'Prof. Sneha Patil',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-TUE-10',
    section: 'CSE B',
    day: 'Tuesday',
    slot: '10:00 - 11:00',
    subject: 'Computer Networks',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-TUE-11',
    section: 'CSE A',
    day: 'Tuesday',
    slot: '11:00 - 12:00',
    subject: 'Discrete Mathematics',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_03',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-TUE-11',
    section: 'CSE B',
    day: 'Tuesday',
    slot: '11:00 - 12:00',
    subject: 'Operating Systems',
    faculty: 'Dr. Ramesh Kulkarni',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-TUE-14',
    section: 'CSE A',
    day: 'Tuesday',
    slot: '14:00 - 15:00',
    subject: 'DBMS Practical',
    faculty: 'Prof. Sneha Patil',
    roomId: 'LAB_03',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEB-TUE-14',
    section: 'CSE B',
    day: 'Tuesday',
    slot: '14:00 - 15:00',
    subject: 'Software Engineering',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },

  // ================= WEDNESDAY =================
  {
    id: 'CSEA-WED-09',
    section: 'CSE A',
    day: 'Wednesday',
    slot: '09:00 - 10:00',
    subject: 'Java Programming',
    faculty: 'Prof. Vikram Desai',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-WED-09',
    section: 'CSE B',
    day: 'Wednesday',
    slot: '09:00 - 10:00',
    subject: 'Data Structures',
    faculty: 'Prof. Anitha Rao',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-WED-10',
    section: 'CSE A',
    day: 'Wednesday',
    slot: '10:00 - 11:00',
    subject: 'Operating Systems Practical',
    faculty: 'Dr. Ramesh Kulkarni',
    roomId: 'LAB_01',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEB-WED-10',
    section: 'CSE B',
    day: 'Wednesday',
    slot: '10:00 - 11:00',
    subject: 'Database Management Systems',
    faculty: 'Prof. Sneha Patil',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-WED-11',
    section: 'CSE A',
    day: 'Wednesday',
    slot: '11:00 - 12:00',
    subject: 'Software Engineering',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-WED-14',
    section: 'CSE B',
    day: 'Wednesday',
    slot: '14:00 - 15:00',
    subject: 'Data Structures Practical',
    faculty: 'Prof. Anitha Rao',
    roomId: 'LAB_02',
    isPractical: true,
    students: 60
  },

  // ================= THURSDAY =================
  {
    id: 'CSEA-THU-09',
    section: 'CSE A',
    day: 'Thursday',
    slot: '09:00 - 10:00',
    subject: 'Computer Networks',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-THU-09',
    section: 'CSE B',
    day: 'Thursday',
    slot: '09:00 - 10:00',
    subject: 'Java Programming',
    faculty: 'Prof. Vikram Desai',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-THU-10',
    section: 'CSE A',
    day: 'Thursday',
    slot: '10:00 - 11:00',
    subject: 'Data Structures',
    faculty: 'Prof. Anitha Rao',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-THU-10',
    section: 'CSE B',
    day: 'Thursday',
    slot: '10:00 - 11:00',
    subject: 'DBMS Practical',
    faculty: 'Prof. Sneha Patil',
    roomId: 'LAB_03',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEA-THU-14',
    section: 'CSE A',
    day: 'Thursday',
    slot: '14:00 - 15:00',
    subject: 'Computer Networks Practical',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'LAB_02',
    isPractical: true,
    students: 60
  },

  // ================= FRIDAY =================
  {
    id: 'CSEA-FRI-09',
    section: 'CSE A',
    day: 'Friday',
    slot: '09:00 - 10:00',
    subject: 'Discrete Mathematics',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-FRI-09',
    section: 'CSE B',
    day: 'Friday',
    slot: '09:00 - 10:00',
    subject: 'Computer Networks',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEA-FRI-10',
    section: 'CSE A',
    day: 'Friday',
    slot: '10:00 - 11:00',
    subject: 'Java Programming Practical',
    faculty: 'Prof. Vikram Desai',
    roomId: 'LAB_01',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEB-FRI-10',
    section: 'CSE B',
    day: 'Friday',
    slot: '10:00 - 11:00',
    subject: 'Software Engineering',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-FRI-14',
    section: 'CSE B',
    day: 'Friday',
    slot: '14:00 - 15:00',
    subject: 'Computer Networks Practical',
    faculty: 'Prof. Karthik Gowda',
    roomId: 'LAB_03',
    isPractical: true,
    students: 60
  },

  // ================= SATURDAY =================
  {
    id: 'CSEA-SAT-09',
    section: 'CSE A',
    day: 'Saturday',
    slot: '09:00 - 10:00',
    subject: 'Database Management Systems',
    faculty: 'Prof. Sneha Patil',
    roomId: 'CR_01',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-SAT-09',
    section: 'CSE B',
    day: 'Saturday',
    slot: '09:00 - 10:00',
    subject: 'Operating Systems Practical',
    faculty: 'Dr. Ramesh Kulkarni',
    roomId: 'LAB_02',
    isPractical: true,
    students: 60
  },
  {
    id: 'CSEA-SAT-10',
    section: 'CSE A',
    day: 'Saturday',
    slot: '10:00 - 11:00',
    subject: 'Software Engineering',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_03',
    isPractical: false,
    students: 60
  },
  {
    id: 'CSEB-SAT-10',
    section: 'CSE B',
    day: 'Saturday',
    slot: '10:00 - 11:00',
    subject: 'Discrete Mathematics',
    faculty: 'Dr. Meera Nair',
    roomId: 'CR_02',
    isPractical: false,
    students: 60
  }
];
