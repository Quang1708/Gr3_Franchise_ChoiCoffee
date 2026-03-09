import type { CustomerAuthProfile } from "@/pages/client/account/model/account.model";
import type { EditProfileFormData } from "../schema/clientProfile.schema";

export interface ProfileHeaderProps {
  profile: CustomerAuthProfile;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
}

export interface PersonalInformationProps {
  profile: CustomerAuthProfile;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: EditProfileFormData) => Promise<void>;
  onCancel: () => void;
}

export interface SecuritySettingsProps {
  onChangePassword: () => void;
  onLogout: () => void;
}

export interface DangerZoneProps {
  onDeactivateRequest: () => void;
}
