import type { CustomerAuthProfile } from "@/pages/client/account/model/account.model";

export interface ProfileHeaderProps {
  profile: CustomerAuthProfile;
}

export interface PersonalInformationProps {
  profile: CustomerAuthProfile;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<CustomerAuthProfile>) => void;
}

export interface SecuritySettingsProps {
  onChangePassword: () => void;
  onLogout: () => void;
}

export interface DangerZoneProps {
  onDeactivateRequest: () => void;
}
