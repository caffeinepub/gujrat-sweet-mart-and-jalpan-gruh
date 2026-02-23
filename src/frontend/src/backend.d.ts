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
    unit: Unit;
    description: string;
    photoUrl: string;
    available: boolean;
    category: Category;
    price: bigint;
}
export enum Category {
    snacks = "snacks",
    namkeen = "namkeen",
    beverages = "beverages",
    sweets = "sweets"
}
export enum Unit {
    per_kg = "per_kg",
    single = "single"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: bigint, available: boolean, unit: Unit, photoUrl: string): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    debugPrintProducts(): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    editProduct(productId: ProductId, name: string, category: Category, description: string, price: bigint, available: boolean, unit: Unit, photoUrl: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
