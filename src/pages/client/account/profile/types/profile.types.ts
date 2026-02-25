export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  role_name: string;
  role_scope: "GLOBAL" | "FRANCHISE";
  franchise_name?: string;
  today_shift?: string;
  last_login?: string;
}

export interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface PersonalInformationProps {
  profile: UserProfile;
  isEditing: boolean;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export interface WorkInformationProps {
  profile: UserProfile;
}

export interface SecuritySettingsProps {
  onChangePassword: () => void;
  onLogout: () => void;
}

export interface DangerZoneProps {
  onDeactivateRequest: () => void;
}
