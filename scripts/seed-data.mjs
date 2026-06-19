import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

function readJson(filename) {
  const fp = join(DATA_DIR, `${filename}.json`);
  return existsSync(fp) ? JSON.parse(readFileSync(fp, 'utf-8')) : [];
}

function writeJson(filename, data) {
  writeFileSync(join(DATA_DIR, `${filename}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

// ── Load existing data ──
const academicYears = readJson('academic-years');
const cycles = readJson('cycles');
const allUnitKpis = readJson('unit-kpis');
const allIndKpis = readJson('individual-kpis');
let existingIndivEvals = readJson('individual-evaluations');
const existingIndivEvalIds = new Set(existingIndivEvals.map(e => e.id));

const existingPlans = readJson('plans');
const existingPlanItems = readJson('plan-items');
const existingScores = readJson('scores');
const existingEvidences = readJson('evidences');
const existingEvaluations = readJson('evaluations');
const existingApprovals = readJson('approvals');

const existingPlanIds = new Set(existingPlans.map(p => p.id));
const existingPlanItemIds = new Set(existingPlanItems.map(p => p.id));
const existingScoreIds = new Set(existingScores.map(s => s.id));
const existingEvalIds = new Set(existingEvaluations.map(e => e.id));
const existingApprovalIds = new Set(existingApprovals.map(a => a.id));
const existingEvidenceIds = new Set(existingEvidences.map(e => e.id));

// ── Helpers ──
const yearMap = { ay001: '2024-2025', ay002: '2025-2026', ay003: '2026-2027' };

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randDate(yearStr) {
  const year = parseInt(yearStr.split('-')[0]);
  const m = randInt(3, 8);
  const d = randInt(1, 28);
  return `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T${randInt(7,17)}:${randInt(0,59)}:${randInt(0,59)}Z`;
}

function getCycleYearId(cycleId) {
  const c = cycles.find(x => x.id === cycleId);
  return c ? c.academicYearId : null;
}

function getYearName(academicYearId) {
  return yearMap[academicYearId] || academicYearId;
}

// Map year-specific unit IDs to their "canonical" short unit code
// ay002 uses "unit_pdt", ay001 uses "unit_mqk7...", ay003 uses "unit_mqk7..."
// Build a lookup: canonical short unit code → { ay001Id, ay002Id, ay003Id, name }
const unitNameByCanonical = {}; // e.g. "unit_pdt" → name
const unitByYear = { ay001: {}, ay002: {}, ay003: {} };
allUnitKpis.forEach(u => {
  const ay = u.academicYearId;
  unitByYear[ay][u.id] = u;
  // Map ay002 names to canonical
  if (ay === 'ay002') {
    unitNameByCanonical[u.id] = u.name;
  }
});
// For ay001 and ay003, match by name to canonical
Object.keys(unitByYear).forEach(ay => {
  if (ay === 'ay002') return;
  Object.entries(unitByYear[ay]).forEach(([id, u]) => {
    if (!unitNameByCanonical[u.name]) {
      // find by name match
      const found = Object.entries(unitNameByCanonical).find(([,n]) => n === u.name);
      if (found) {
        // already has entry
      } else {
        unitNameByCanonical[u.name] = u.name;
      }
    }
  });
});

// Build canonical → year-specific IDs
const canonicalIds = {};
allUnitKpis.filter(u => u.academicYearId === 'ay002').forEach(u => {
  canonicalIds[u.id] = { ay002: u.id, name: u.name };
});
allUnitKpis.filter(u => u.academicYearId === 'ay001').forEach(u => {
  const entry = Object.values(canonicalIds).find(e => e.name === u.name);
  if (entry) entry.ay001 = u.id;
});
allUnitKpis.filter(u => u.academicYearId === 'ay003').forEach(u => {
  const entry = Object.values(canonicalIds).find(e => e.name === u.name);
  if (entry) entry.ay003 = u.id;
});

function getUnitId(canonical, ay) {
  const entry = canonicalIds[canonical];
  return entry ? (entry[ay] || canonical) : canonical;
}

function getUnitKpis(canonical, ay) {
  const id = getUnitId(canonical, ay);
  const match = allUnitKpis.find(u => u.id === id && u.academicYearId === ay);
  return match ? match.kpis : [];
}

// ── Stats ──
const newPlans = [];
const newPlanItems = [];
const newScores = [];
const newEvidences = [];
const newEvaluations = [];
const newApprovals = [];
const newIndivEvals = [];

// ── 1. Generate Plans ──
console.log('=== Generating Plans ===');
const canonicals = Object.keys(canonicalIds);
const cyclesPerYear = { ay001: [], ay002: [], ay003: [] };
cycles.forEach(c => {
  if (cyclesPerYear[c.academicYearId]) cyclesPerYear[c.academicYearId].push(c);
});

Object.entries(cyclesPerYear).forEach(([ay, cycs]) => {
  cycs.forEach(cycle => {
    canonicals.forEach(canonical => {
      const unitId = getUnitId(canonical, ay);
      const planId = `plan_${unitId}_${cycle.id}`;
      if (!existingPlanIds.has(planId)) {
        const status = ay === 'ay002' ? 'submitted' : (ay === 'ay001' ? 'approved' : 'draft');
        const submittedAt = (status === 'submitted' || status === 'approved') ? randDate(getYearName(ay)) : null;
        const approvedAt = status === 'approved' ? randDate(getYearName(ay)) : null;
        const createdAt = randDate(getYearName(ay));
        newPlans.push({
          id: planId,
          cycleId: cycle.id,
          ownerType: 'unit',
          ownerId: unitId,
          status,
          submittedAt,
          approvedAt,
          createdAt,
          updatedAt: submittedAt || createdAt,
        });
        existingPlanIds.add(planId);
      }
    });
  });
});

console.log(`  New plans: ${newPlans.length}`);

// ── 2. Generate Plan-items ──
console.log('=== Generating Plan-items ===');
const allPlans = [...existingPlans, ...newPlans];
allPlans.forEach(plan => {
  if (existingPlanItems.some(pi => pi.planId === plan.id)) return; // already has items
  const cycle = cycles.find(c => c.id === plan.cycleId);
  if (!cycle) return;
  const ay = cycle.academicYearId;
  const unitKpis = allUnitKpis.find(u => u.id === plan.ownerId && u.academicYearId === ay);
  if (!unitKpis || !unitKpis.kpis) return;
  unitKpis.kpis.forEach(kpi => {
    const piId = `pi_${kpi.id}_${plan.cycleId}`;
    if (!existingPlanItemIds.has(piId) && !newPlanItems.find(p => p.id === piId)) {
      newPlanItems.push({
        id: piId,
        planId: plan.id,
        indicatorId: kpi.indicatorId || null,
        targetValue: kpi.target,
        weight: kpi.weight,
        dueDate: cycle.endDate,
      });
      existingPlanItemIds.add(piId);
    }
  });
});

console.log(`  New plan-items: ${newPlanItems.length}`);

// ── 3. Generate Scores ──
console.log('=== Generating Scores ===');
const allPlanItems = [...existingPlanItems, ...newPlanItems];
allPlanItems.forEach(pi => {
  const scoreId = `score_${pi.id}`;
  if (!existingScoreIds.has(scoreId) && !newScores.find(s => s.id === scoreId)) {
    // Generate realistic scores: some null (not yet evaluated), some with values
    const hasScores = Math.random() < 0.6; // 60% have scores
    newScores.push({
      id: scoreId,
      planItemId: pi.id,
      selfScore: hasScores ? randInt(50, 120) : null,
      managerScore: hasScores ? (Math.random() < 0.7 ? randInt(50, 120) : null) : null,
      councilScore: hasScores ? (Math.random() < 0.5 ? randInt(50, 120) : null) : null,
      finalScore: null, // computed by API when all 3 are set
    });
    existingScoreIds.add(scoreId);
  }
});

console.log(`  New scores: ${newScores.length}`);

// ── 4. Generate Evidences ──
console.log('=== Generating Evidences ===');
const evidenceTypes = ['file', 'url', 'system_log'];
const fileNames = [
  'Bao_cao_tuyen_sinh.xlsx', 'Danh_sach_giang_vien.xlsx', 'Bao_cao_NCKH.docx',
  'Minh_chung_CDS.pdf', 'Bang_diem_tong_ket.xlsx', 'Bien_ban_hop.docx',
  'So_lieu_thong_ke.xlsx', 'De_cuong_mon_hoc.pdf', 'Khao_sat_HL.docx',
  'Bao_cao_tai_chinh.xlsx', 'Phan_cong_GD.docx', 'Lich_trinh_DT.xlsx',
  'Bao_cao_TT.pdf', 'Ket_qua_DG.docx', 'Hop_dong_NCKH.pdf',
];
const submitters = [
  'Trần Thị B', 'Chuyên viên KHCN', 'Lê Hoàng D', 'Đặng Phúc H',
  'Phạm Minh E', 'Hoàng Thị F', 'Vũ Thanh G', 'Ngô Thị K',
];

// Helper: extract cycleId from planId like "plan_unit_pdt_c001" → "c001"
function planIdToCycleId(planId) {
  const parts = planId.split('_');
  return parts[parts.length - 1];
}

allPlanItems.forEach(pi => {
  // 20% chance of having evidence
  if (Math.random() > 0.2) return;
  const evId = `EV${generateId().substring(0, 8)}`;
  if (!existingEvidenceIds.has(evId) && !newEvidences.find(e => e.id === evId)) {
    const statuses = ['valid', 'pending', 'needs_supplement'];
    const status = pickRandom(statuses);
    const cycleId = planIdToCycleId(pi.planId);
    const yearName = getYearName(getCycleYearId(cycleId) || 'ay002');
    const ev = {
      id: evId,
      planItemId: pi.id,
      evidenceType: pickRandom(evidenceTypes),
      fileName: pickRandom(fileNames),
      status,
      submittedAt: randDate(yearName),
      submittedBy: pickRandom(submitters),
    };
    if (status === 'valid' || status === 'needs_supplement') {
      ev.reviewerNote = status === 'valid' ? 'Dữ liệu chính xác' : 'Cần bổ sung thêm thông tin';
      ev.reviewedBy = 'PGS.TS Nguyễn Mạnh Hùng';
      ev.reviewedAt = randDate(yearName);
    }
    newEvidences.push(ev);
    existingEvidenceIds.add(ev.id);
  }
});

console.log(`  New evidences: ${newEvidences.length}`);

// ── 5. Generate Unit Evaluations ──
console.log('=== Generating Unit Evaluations ===');
const evalComments = [
  'Hoàn thành tốt các chỉ tiêu, cần duy trì',
  'Đạt kế hoạch đề ra, một số chỉ tiêu vượt mức',
  'Cần cải thiện chất lượng báo cáo và tiến độ',
  'Thực hiện nghiêm túc, kết quả khả quan',
  'Hoàn thành cơ bản, một số chỉ tiêu chưa đạt',
  'Vượt chỉ tiêu ở nhiều lĩnh vực',
  'Cần tăng cường công tác số hóa và báo cáo',
  'Đạt yêu cầu, đề nghị phát huy thế mạnh',
];

allPlans.forEach(plan => {
  const evalId = `EVL_${plan.id}`;
  if (!existingEvalIds.has(evalId) && !newEvaluations.find(e => e.id === evalId)) {
    const statuses = ['pending', 'submitted', 'approved'];
    const status = plan.status === 'approved' ? 'approved' : (plan.status === 'submitted' ? pickRandom(['submitted', 'approved']) : 'pending');
    newEvaluations.push({
      id: evalId,
      planId: plan.id,
      evaluatorId: '',
      evaluationType: 'self',
      comment: pickRandom(evalComments),
      status,
      level: 'unit',
      personId: null,
      personName: null,
      positionCode: null,
      createdAt: randDate(getYearName(getCycleYearId(plan.cycleId) || 'ay002')),
      updatedAt: randDate(getYearName(getCycleYearId(plan.cycleId) || 'ay002')),
    });
    existingEvalIds.add(evalId);
  }
});

console.log(`  New unit evaluations: ${newEvaluations.length}`);

// ── 6. Generate Individual Evaluations ──
console.log('=== Generating Individual Evaluations ===');
// Extract position code → position data mapping for each year
const posByCode = { ay001: {}, ay002: {}, ay003: {} };
allIndKpis.forEach(pos => {
  const ay = pos.academicYearId;
  if (posByCode[ay]) {
    posByCode[ay][pos.code] = pos;
  }
});

// People per position (name, unit mapping)
const peopleByPosition = {
  GV: [
    { name: 'Nguyễn Văn A', unitName: 'Khoa Công nghệ Thông tin', unitId: 'u_khoa_cntt' },
    { name: 'Lê Hoàng D', unitName: 'Trường Bách khoa', unitId: 'u_bach_khoa' },
    { name: 'Trần Minh C', unitName: 'Trường Kinh tế', unitId: 'u_kinh_te' },
  ],
  GVQL: [
    { name: 'Phạm Minh E', unitName: 'Khoa Công nghệ Thông tin', unitId: 'u_khoa_cntt' },
    { name: 'Lý Quốc H', unitName: 'Trường Bách khoa', unitId: 'u_bach_khoa' },
  ],
  LD: [
    { name: 'PGS.TS Nguyễn Mạnh Hùng', unitName: 'Ban Giám đốc', unitId: 'u_ban_gd' },
    { name: 'Trần Thị B', unitName: 'Phòng Đào tạo', unitId: 'unit_pdt' },
  ],
  BM: [
    { name: 'Nguyễn Thị M', unitName: 'Bộ môn CNTT', unitId: 'unit_bo_mon' },
  ],
  NCV: [
    { name: 'Hoàng Thị F', unitName: 'Đơn vị Nghiên cứu', unitId: 'unit_nghien_cuu' },
  ],
  CV: [
    { name: 'Vũ Thanh G', unitName: 'Phòng Kế hoạch và Tài chính', unitId: 'unit_khtc' },
  ],
  CVDT: [
    { name: 'Trần Văn N', unitName: 'Phòng Đào tạo', unitId: 'unit_pdt' },
  ],
  CVDBCL: [
    { name: 'Lê Thị P', unitName: 'Phòng Quản lý chất lượng', unitId: 'unit_dbcl' },
  ],
  CVKHCN: [
    { name: 'Nguyễn Văn Q', unitName: 'Phòng KHCN, CĐMST', unitId: 'unit_khcn' },
  ],
  CVHTQT: [
    { name: 'Phạm Thị R', unitName: 'Phòng Đối ngoại và Đào tạo quốc tế', unitId: 'unit_htqt' },
  ],
  CVTCCB: [
    { name: 'Đỗ Văn S', unitName: 'Phòng Tổ chức và Phát triển nhân sự', unitId: 'unit_tccb' },
  ],
  CVKHTC: [
    { name: 'Ngô Thị T', unitName: 'Phòng Kế hoạch và Tài chính', unitId: 'unit_khtc' },
  ],
  CVCNTT: [
    { name: 'Đặng Phúc H', unitName: 'Trung tâm CĐS và Truyền thông', unitId: 'unit_cntt' },
  ],
  CVTT: [
    { name: 'Ngô Thị K', unitName: 'Trung tâm Truyền thông và Tuyển sinh', unitId: 'unit_truyen_thong' },
  ],
  TV: [
    { name: 'Phạm Văn U', unitName: 'Thư viện Đại học Cần Thơ', unitId: 'unit_thu_vien' },
  ],
  KTX: [
    { name: 'Trương Đức L', unitName: 'Ký túc xá', unitId: 'unit_ktx' },
  ],
  HC: [
    { name: 'Huỳnh Văn V', unitName: 'Văn phòng Đại học Cần Thơ', unitId: 'unit_vpt' },
  ],
  KTPTN: [
    { name: 'Lâm Văn W', unitName: 'Khoa Công nghệ Thông tin', unitId: 'unit_khoa_cntt' },
  ],
  PV: [
    { name: 'Trần Văn X', unitName: 'Trung tâm Dịch vụ và Hỗ trợ đào tạo', unitId: 'unit_dich_vu' },
  ],
  KPISTAFF: [
    { name: 'Nguyễn Văn Y', unitName: 'Văn phòng Đại học Cần Thơ', unitId: 'unit_vpt' },
  ],
  CN: [
    { name: 'Phan Văn Z', unitName: 'Trường Bách khoa', unitId: 'u_bach_khoa' },
  ],
};

Object.entries(cyclesPerYear).forEach(([ay, cycs]) => {
  const yearName = getYearName(ay);
  cycs.forEach(cycle => {
    Object.entries(peopleByPosition).forEach(([code, people]) => {
      people.forEach(person => {
        const posDef = posByCode[ay]?.[code];
        if (!posDef) return;
        const evalId = `EVL_i_${code}_${ay}_${cycle.id}_${person.name.replace(/[^a-zA-Z]/g, '')}`;
        if (existingIndivEvalIds.has(evalId) || newIndivEvals.find(e => e.id === evalId)) return;

        const selfScore = randInt(50, 120);
        const managerScore = Math.random() < 0.7 ? randInt(50, 120) : null;
        const councilScore = Math.random() < 0.4 ? randInt(50, 120) : null;
        const finalScore = (selfScore && managerScore && councilScore)
          ? Math.round((selfScore + managerScore + councilScore) / 3)
          : (selfScore && managerScore ? Math.round((selfScore + managerScore) / 2) : null);
        const grade = finalScore ? (
          finalScore >= 90 ? 'Xuất sắc' :
          finalScore >= 75 ? 'Tốt' :
          finalScore >= 60 ? 'Đạt' :
          finalScore >= 40 ? 'Cần cải thiện' : 'Không đạt'
        ) : null;

        const statuses = ['pending', 'self_evaluated', 'manager_review', 'evaluated', 'locked'];
        const status = finalScore ? (Math.random() < 0.3 ? 'locked' : pickRandom(['evaluated', 'manager_review', 'self_evaluated'])) : 'pending';

        newIndivEvals.push({
          id: evalId,
          unitId: person.unitId,
          unitName: person.unitName,
          cycleName: cycle.name,
          level: 'individual',
          personId: `u_${code}_${ay}`,
          personName: person.name,
          positionCode: code,
          personUnitId: person.unitId,
          selfScore,
          selfComment: pickRandom(evalComments),
          managerScore,
          managerComment: managerScore ? pickRandom(evalComments) : '',
          councilScore,
          councilComment: councilScore ? pickRandom(evalComments) : '',
          finalScore,
          grade,
          status,
          selfEvaluatedAt: randDate(yearName),
          managerReviewedAt: managerScore ? randDate(yearName) : null,
          councilReviewedAt: councilScore ? randDate(yearName) : null,
          lockedAt: status === 'locked' ? randDate(yearName) : null,
          createdAt: randDate(yearName),
          updatedAt: randDate(yearName),
        });
        existingEvalIds.add(evalId);
      });
    });
  });
});

console.log(`  New individual evaluations: ${newIndivEvals.length}`);

// (Approvals are generated later after data is written to disk)

// ── Write data (intermediate + final) ──
console.log('\n=== Writing files ===');

writeJson('plans', [...existingPlans, ...newPlans]);
console.log(`  plans.json: ${existingPlans.length + newPlans.length} records`);

writeJson('plan-items', [...existingPlanItems, ...newPlanItems]);
console.log(`  plan-items.json: ${existingPlanItems.length + newPlanItems.length} records`);

writeJson('scores', [...existingScores, ...newScores]);
console.log(`  scores.json: ${existingScores.length + newScores.length} records`);

writeJson('evidences', [...existingEvidences, ...newEvidences]);
console.log(`  evidences.json: ${existingEvidences.length + newEvidences.length} records`);

writeJson('evaluations', [...existingEvaluations, ...newEvaluations]);
console.log(`  evaluations.json: ${existingEvaluations.length + newEvaluations.length} records`);

// Approvals need to be generated after plans, evidences, evaluations are on disk
// because the approval generation reads from disk to get fresh data
// ── Re-read for approval generation ──
const diskEvidences = readJson('evidences');
const diskEvaluations = readJson('evaluations');
const diskPlans = readJson('plans');
const diskApprovals = readJson('approvals');
const diskApprovalIds = new Set(diskApprovals.map(a => a.id));

// ── 7b. Generate Approvals (must run after evidence/evaluation writes) ──
console.log('\n=== Generating Approvals (after data write) ===');

// Plan approvals
diskPlans.filter(p => p.status === 'submitted' || p.status === 'approved').forEach(plan => {
  const unit = allUnitKpis.find(u => u.id === plan.ownerId);
  const unitName2 = unit ? unit.name : plan.ownerId;
  const apId = `AP_plan_${plan.id}`;
  if (diskApprovalIds.has(apId)) return;
  const apStatus = plan.status === 'approved' ? 'approved' : 'pending';
  const ap = {
    id: apId,
    objectType: 'plan',
    objectId: plan.id,
    objectTitle: `Kế hoạch KPI ${unitName2}`,
    unitName: unitName2,
    submitter: unitName2,
    status: apStatus,
    approverId: apStatus === 'approved' ? 'u013' : null,
    approverName: apStatus === 'approved' ? 'PGS.TS Nguyễn Mạnh Hùng' : null,
    note: apStatus === 'approved' ? 'Phê duyệt' : null,
    submittedAt: plan.submittedAt || randDate(getYearName(getCycleYearId(plan.cycleId) || 'ay002')),
    decidedAt: apStatus === 'approved' ? (plan.approvedAt || randDate(getYearName(getCycleYearId(plan.cycleId) || 'ay002'))) : null,
  };
  diskApprovals.push(ap);
  diskApprovalIds.add(apId);
});

// Evidence approvals
diskEvidences.forEach(ev => {
  if (ev.status !== 'valid' && ev.status !== 'needs_supplement') return;
  if (Math.random() > 0.3) return;
  const apId = `AP_ev_${ev.id}`;
  if (diskApprovalIds.has(apId)) return;
  diskApprovals.push({
    id: apId,
    objectType: 'evidence',
    objectId: ev.id,
    objectTitle: `Minh chứng ${ev.fileName}`,
    unitName: ev.submittedBy,
    submitter: ev.submittedBy,
    status: ev.status === 'valid' ? 'approved' : 'needs_revision',
    approverId: ev.status === 'valid' ? 'u013' : null,
    approverName: ev.status === 'valid' ? 'PGS.TS Nguyễn Mạnh Hùng' : null,
    note: ev.status === 'valid' ? 'Hợp lệ' : 'Cần chỉnh sửa',
    submittedAt: ev.submittedAt,
    decidedAt: ev.reviewedAt || null,
  });
  diskApprovalIds.add(apId);
});

// Evaluation approvals
diskEvaluations.filter(e => e.level === 'unit' || !e.level).forEach(evl => {
  if (evl.status !== 'submitted' && evl.status !== 'approved') return;
  if (Math.random() > 0.3) return;
  const planMatch = diskPlans.find(p => p.id === evl.planId);
  const unitEval = planMatch ? allUnitKpis.find(u => u.id === planMatch.ownerId) : null;
  const unitName3 = unitEval ? unitEval.name : (planMatch ? planMatch.ownerId : '');
  const apId = `AP_evl_${evl.id}`;
  if (diskApprovalIds.has(apId)) return;
  diskApprovals.push({
    id: apId,
    objectType: 'evaluation',
    objectId: evl.id,
    objectTitle: `Đánh giá KPI ${unitName3}`,
    unitName: unitName3,
    submitter: unitName3 || 'Đơn vị',
    status: evl.status === 'approved' ? 'approved' : 'pending',
    approverId: evl.status === 'approved' ? 'u013' : null,
    approverName: evl.status === 'approved' ? 'PGS.TS Nguyễn Mạnh Hùng' : null,
    note: evl.status === 'approved' ? 'Phê duyệt' : null,
    submittedAt: evl.createdAt || randDate('2025'),
    decidedAt: evl.status === 'approved' ? evl.updatedAt : null,
  });
  diskApprovalIds.add(apId);
});

writeJson('approvals', diskApprovals);
console.log(`  approvals.json: ${diskApprovals.length} records`);

// ── 8. Create individual-evaluations.json for the individual evaluation page ──
const combinedIndivEvals = [...existingIndivEvals, ...newIndivEvals];
writeJson('individual-evaluations', combinedIndivEvals);
console.log(`  individual-evaluations.json: ${combinedIndivEvals.length} records`);

console.log('\n=== Seed complete ===');
