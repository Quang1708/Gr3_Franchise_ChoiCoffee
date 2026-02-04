export interface Shift {
    id: number;
    franchiseId: number;
    name: string; // Morning / Evening / Night
    startTime: string; // Format: "HH:mm:ss"
    endTime: string; // Format: "HH:mm:ss"
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}