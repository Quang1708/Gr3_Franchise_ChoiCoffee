export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  address: string;
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

export interface SecuritySettingsProps {
  onChangePassword: () => void;
  onLogout: () => void;
}

export interface DangerZoneProps {
  onDeactivateRequest: () => void;
}
