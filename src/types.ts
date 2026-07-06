// A recurring 10-minute goal — the bare-minimum unit of action
// that keeps the decade goal alive today.
export interface Goal {
  id: string;
  title: string;
  createdAt: number;
  lastUsedAt: number;
}
