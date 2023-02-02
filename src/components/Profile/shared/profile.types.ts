export enum StageRole {
  'OnStage' = 'on-stage',
  'OffStage' = 'off-stage'
}

export enum ProductionEquity {
  'Union' = 'Union',
  'NonUnion' = 'Non-Union'
}

export enum ProductionType {
  'Musical' = 'Musical',
  'Play' = 'Play',
  'Other' = 'Other'
}

export enum ProductionStatus {
  'OpenCasting' = 'Open Casting',
  'Auditioning' = 'Auditioning',
  'Production' = 'Production'
}

export enum RoleStatus {
  'Open' = 'open',
  'Closed' = 'closed'
}

export type EnumType = { [s: string]: string };
