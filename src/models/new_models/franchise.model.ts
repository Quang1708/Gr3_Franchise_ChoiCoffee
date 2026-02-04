export interface Franchise {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
  address: string;
  openedAt: string;
  closedAt: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
