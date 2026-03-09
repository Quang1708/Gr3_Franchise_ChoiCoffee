export interface CustomerRequest {
    email: string;
    password: string;
    phone: string;
    name?: string;
    address?: string;
    avatar_url?: string;
}