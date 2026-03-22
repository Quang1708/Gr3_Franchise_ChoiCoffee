export interface RequestUserFranchiseRole {
  user_id: string;
  role_id: string;
  franchise_id: string | null;
  note: string;
}
