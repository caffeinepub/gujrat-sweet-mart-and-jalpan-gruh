import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ProductId = bigint;
export interface UserProfile {
    name: string;
}
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    available: boolean;
    category: Category;
    price: bigint;
}
export enum Category {
    snacks = "snacks",
    namkeen = "namkeen",
    sweets = "sweets"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: bigint, available: boolean): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    editProduct(productId: ProductId, name: string, category: Category, description: string, price: bigint, available: boolean): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
