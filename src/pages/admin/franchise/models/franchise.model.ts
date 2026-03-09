export interface FranchiseResponse {
  id: string
  code: string
  name: string
  address?: string
  hotline?: string
  logo_url?: string
  opened_at?: string
  closed_at?: string
  is_active?: boolean
  is_deleted?: boolean
}

export interface Franchise {
  id: string
  code: string
  name: string
  address?: string
  hotline?: string
  logo_url?: string
  opened_at?: string
  closed_at?: string
  isActive?: boolean
  isDeleted?: boolean
}

export const mapFranchise = (raw: FranchiseResponse): Franchise => ({
  id: raw.id,
  code: raw.code,
  name: raw.name,
  address: raw.address ?? "",
  hotline: raw.hotline ?? "",
  logo_url: raw.logo_url ?? "",
  opened_at: raw.opened_at ?? "",
  closed_at: raw.closed_at ?? "",
  isActive: raw.is_active ?? true,
  isDeleted: raw.is_deleted ?? false,
})