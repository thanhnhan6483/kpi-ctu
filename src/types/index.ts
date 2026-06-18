export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  employeeCode: string;
  unitId: string;
  positionId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  scopeUnitId?: string;
}

export interface OrganizationalUnit {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: 'university' | 'faculty' | 'department' | 'center' | 'division';
  managerId: string;
  status: 'active' | 'inactive';
}

export interface KPICycle {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'locked';
}

export interface KPIGroup {
  id: string;
  name: string;
  code: string;
  defaultWeight: number;
  targetLevel: 'school' | 'unit' | 'individual';
}

export interface KPIIndicator {
  id: string;
  code: string;
  name: string;
  groupId: string;
  formula: string;
  unit: string;
  direction: 'higher_better' | 'lower_better';
  requiredEvidence: boolean;
  maxScore: number;
  targetValue: number;
  weight: number;
}

export interface KPITemplate {
  id: string;
  name: string;
  targetRole: string;
  targetLevel: string;
  status: 'draft' | 'approved';
}

export interface KPITemplateItem {
  templateId: string;
  indicatorId: string;
  weight: number;
  targetValue: number;
  capRate: number;
}

export interface KPIPlan {
  id: string;
  cycleId: string;
  ownerType: 'unit' | 'individual';
  ownerId: string;
  status: 'draft' | 'submitted' | 'approved' | 'in_progress' | 'evaluated' | 'locked';
  submittedAt?: string;
  approvedAt?: string;
}

export interface KPIPlanItem {
  id: string;
  planId: string;
  indicatorId: string;
  targetValue: number;
  weight: number;
  dueDate: string;
}

export interface KPIProgress {
  id: string;
  planItemId: string;
  actualValue: number;
  progressDate: string;
  note: string;
  updatedBy: string;
}

export interface KPIEvidence {
  id: string;
  planItemId: string;
  evidenceType: 'file' | 'url' | 'system_log' | 'survey' | 'email';
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  status: 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface KPIEvaluation {
  id: string;
  planId: string;
  evaluatorId: string;
  evaluationType: 'self' | 'manager' | 'council';
  score: number;
  comment: string;
  status: 'pending' | 'submitted' | 'approved';
  level?: 'unit' | 'individual';
  personId?: string;
  personName?: string;
  positionCode?: string;
  personUnitId?: string;
}

export interface KPIScore {
  id: string;
  planItemId: string;
  selfScore: number;
  managerScore: number;
  councilScore: number;
  finalScore: number;
}

export interface KPIApproval {
  id: string;
  objectType: 'plan' | 'evidence' | 'evaluation';
  objectId: string;
  approverId: string;
  action: 'approve' | 'reject' | 'request_revision';
  note: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  objectType: string;
  objectId: string;
  ipAddress: string;
  createdAt: string;
}

export type PlanStatus = 'draft' | 'submitted' | 'needs_revision' | 'approved' | 'in_progress' | 'submitted_result' | 'confirmed' | 'evaluated' | 'locked';

export type EvidenceStatus = 'pending' | 'submitted' | 'needs_supplement' | 'valid' | 'invalid' | 'locked';

export type EvaluationType = 'self' | 'manager' | 'council';

export type GradeLevel = 'xuat_sac' | 'tot' | 'dat' | 'can_cai_thien' | 'khong_dat';
