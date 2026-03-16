import { axiosAdminClient } from "@/api";
import type { CreateShiftData } from "../models/createShift.model";

export const createShift = async (data: CreateShiftData) => {
    const response = await axiosAdminClient.post("/api/shifts", data);
    return response.data;
};

export const updateShift = async (id: string, data: CreateShiftData) => {
    const response = await axiosAdminClient.put(`/api/shifts/${id}`, data);
    return response.data;
};