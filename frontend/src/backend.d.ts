import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UpiConfig {
    upiId: string;
    qrCode: ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface HomepageConfig {
    hours: string;
    logo: ExternalBlob;
    address: string;
    phone: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CustomerProfile {
    principal: Principal;
    name: string;
    address: string;
    phone: string;
}
export interface Order {
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: Variant_cashOnDelivery_online;
    customerPrincipal: Principal;
    name: string;
    deliveryTime?: DeliveryTime;
    orderId: bigint;
    address: string;
    timestamp: Time;
    phone: string;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface DeliveryTime {
    value: bigint;
    unit: TimeUnit;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
    totalPrice: bigint;
}
export interface UserProfile {
    fullName: string;
    email: string;
    contactNumber: string;
    principalId: Principal;
    deliveryApprovalStatus: DeliveryApprovalStatus;
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
export enum DeliveryApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    outForDelivery = "outForDelivery",
    orderPlaced = "orderPlaced",
    delivered = "delivered"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid",
    refunded = "refunded",
    failed = "failed"
}
export enum TimeUnit {
    hours = "hours",
    days = "days",
    minutes = "minutes"
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
export enum Variant_cashOnDelivery_online {
    cashOnDelivery = "cashOnDelivery",
    online = "online"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: bigint, available: boolean, unit: Unit, photoUrl: string): Promise<ProductId>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    approveDeliveryPrincipal(principal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignDeliveryRole(deliveryPerson: Principal): Promise<void>;
    cancelOrder(orderId: bigint): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(name: string, phone: string, address: string, paymentMethod: Variant_cashOnDelivery_online): Promise<bigint>;
    deleteProduct(productId: ProductId): Promise<void>;
    editProduct(productId: ProductId, name: string, category: Category, description: string, price: bigint, available: boolean, unit: Unit, photoUrl: string): Promise<void>;
    getActiveOrdersForDelivery(): Promise<Array<Order>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPendingDeliveryProfiles(): Promise<Array<UserProfile>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCustomerProfile(): Promise<CustomerProfile | null>;
    getHomepageConfig(): Promise<HomepageConfig | null>;
    getMyProfile(): Promise<UserProfile | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpiConfig(): Promise<UpiConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isDeliveryPerson(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markOrderAsPaid(orderId: bigint): Promise<void>;
    rejectDeliveryPrincipal(principal: Principal): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(fullName: string, contactNumber: string, email: string): Promise<void>;
    saveCustomerProfile(name: string, phone: string, address: string): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setDeliveryTime(orderId: bigint, value: bigint, unit: TimeUnit): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUpiConfig(config: UpiConfig): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateHomepageConfig(config: HomepageConfig): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updateOrderStatusByDeliveryPerson(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updatePaymentStatus(orderId: bigint, newStatus: PaymentStatus): Promise<void>;
}
