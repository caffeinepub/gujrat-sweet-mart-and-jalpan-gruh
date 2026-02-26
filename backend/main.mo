import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import UserApproval "user-approval/approval";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  type ProductId = Nat;
  type OrderId = Nat;

  public type Category = {
    #sweets;
    #snacks;
    #namkeen;
    #beverages;
  };

  public type Unit = {
    #per_kg;
    #single;
  };

  public type Product = {
    id : ProductId;
    name : Text;
    category : Category;
    description : Text;
    price : Nat;
    available : Bool;
    unit : Unit;
    photoUrl : Text;
  };

  public type UpiConfig = {
    upiId : Text;
    qrCode : Storage.ExternalBlob;
  };

  var upiConfig : ?UpiConfig = null;

  public shared ({ caller }) func setUpiConfig(config : UpiConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set UPI config");
    };
    upiConfig := ?config;
  };

  public query ({ caller }) func getUpiConfig() : async ?UpiConfig {
    upiConfig;
  };

  type ProductAlias = Product; // Alias for Map type inference
  type ProductMap = Map.Map<ProductId, ProductAlias>;
  var nextProductId : ProductId = 0;
  let products : ProductMap = Map.empty<ProductId, ProductAlias>();

  public type DeliveryApprovalStatus = { #pending; #approved; #rejected };

  public type UserProfile = {
    fullName : Text;
    contactNumber : Text;
    email : Text;
    principalId : Principal;
    deliveryApprovalStatus : DeliveryApprovalStatus;
  };

  public shared ({ caller }) func saveCallerUserProfile(fullName : Text, contactNumber : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let newProfile : UserProfile = {
      fullName;
      contactNumber;
      email;
      principalId = caller;
      deliveryApprovalStatus = #pending;
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func approveDeliveryPrincipal(principal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve delivery principals");
    };

    switch (userProfiles.get(principal)) {
      case (null) { Runtime.trap("No user profile found for that principal") };
      case (?profile) {
        let updatedProfile = { profile with deliveryApprovalStatus = #approved };
        userProfiles.add(principal, updatedProfile);

        let assignment : DeliveryAssignment = {
          assignedBy = caller;
          timestamp = Time.now();
        };
        deliveryAssignments.add(principal, assignment);
      };
    };
  };

  public shared ({ caller }) func rejectDeliveryPrincipal(principal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject delivery principals");
    };

    switch (userProfiles.get(principal)) {
      case (null) { Runtime.trap("No user profile found for that principal") };
      case (?profile) {
        let updatedProfile = { profile with deliveryApprovalStatus = #rejected };
        userProfiles.add(principal, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getAllPendingDeliveryProfiles() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all pending profiles");
    };

    let profiles = userProfiles.values().toArray();
    profiles.filter(func(profile) { profile.deliveryApprovalStatus == #pending });
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Category,
    description : Text,
    price : Nat,
    available : Bool,
    unit : Unit,
    photoUrl : Text,
  ) : async ProductId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    let newProduct : Product = {
      id = productId;
      name;
      category;
      description;
      price;
      available;
      unit;
      photoUrl;
    };

    products.add(productId, newProduct);
    nextProductId += 1;
    productId;
  };

  public shared ({ caller }) func editProduct(
    productId : ProductId,
    name : Text,
    category : Category,
    description : Text,
    price : Nat,
    available : Bool,
    unit : Unit,
    photoUrl : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit products");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (_) {
        let updatedProduct : Product = {
          id = productId;
          name;
          category;
          description;
          price;
          available;
          unit;
          photoUrl;
        };

        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (_) {
        products.remove(productId);
      };
    };
  };

  public query func getAllProducts() : async [Product] {
    let iter = products.values();
    iter.toArray();
  };

  public query func getProduct(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    let iter = products.values();
    let filteredIter = iter.filter(func(product) { product.category == category });
    filteredIter.toArray();
  };

  public type CartItem = {
    productId : ProductId;
    quantity : Nat;
    totalPrice : Nat;
  };

  type ShoppingCartMap = Map.Map<Principal, List.List<CartItem>>;
  let shoppingCarts : ShoppingCartMap = Map.empty<Principal, List.List<CartItem>>();

  public type CustomerProfile = {
    principal : Principal;
    name : Text;
    phone : Text;
    address : Text;
  };

  type CustomerProfileMap = Map.Map<Principal, CustomerProfile>;
  let customerProfiles : CustomerProfileMap = Map.empty<Principal, CustomerProfile>();

  public type PaymentStatus = {
    #pending;
    #paid;
    #refunded;
    #failed;
  };

  public type TimeUnit = {
    #minutes;
    #hours;
    #days;
  };

  public type DeliveryTime = {
    value : Nat;
    unit : TimeUnit;
  };

  public type Order = {
    orderId : Nat;
    customerPrincipal : Principal;
    name : Text;
    phone : Text;
    address : Text;
    items : [CartItem];
    paymentMethod : { #cashOnDelivery; #online };
    status : OrderStatus;
    paymentStatus : PaymentStatus;
    timestamp : Time.Time;
    deliveryTime : ?DeliveryTime;
  };

  public type OrderStatus = {
    #orderPlaced;
    #shipped;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type OrderMap = Map.Map<Nat, Order>;
  var nextOrderId = 0;
  let orders : OrderMap = Map.empty<Nat, Order>();

  var configuration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (not product.available) {
      Runtime.trap("Product is not available");
    };

    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };

    cart.add({
      productId;
      quantity;
      totalPrice = product.price * quantity;
    });

    shoppingCarts.add(caller, cart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (shoppingCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    shoppingCarts.remove(caller);
  };

  public shared ({ caller }) func saveCustomerProfile(
    name : Text,
    phone : Text,
    address : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save customer profiles");
    };

    let profile : CustomerProfile = {
      principal = caller;
      name;
      phone;
      address;
    };

    customerProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCustomerProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customer profiles");
    };

    customerProfiles.get(caller);
  };

  public shared ({ caller }) func createOrder(
    name : Text,
    phone : Text,
    address : Text,
    paymentMethod : { #cashOnDelivery; #online }
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (cart.isEmpty()) {
      Runtime.trap("Cart is empty");
    };

    let orderId = nextOrderId;
    let newOrder : Order = {
      orderId;
      customerPrincipal = caller;
      name;
      phone;
      address;
      items = cart.toArray();
      paymentMethod;
      status = #orderPlaced;
      paymentStatus = #pending;
      timestamp = Time.now();
      deliveryTime = null;
    };

    orders.add(orderId, newOrder);
    shoppingCarts.remove(caller); // Clear cart after successful order
    nextOrderId += 1;
    orderId;
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customerPrincipal != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own orders");
        };
        switch (order.status) {
          case (#orderPlaced) {};
          case (#shipped) {};
          case (_) {
            Runtime.trap("Order cannot be cancelled at this stage");
          };
        };
        let cancelledOrder = { order with status = #cancelled };
        orders.add(orderId, cancelledOrder);
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updatePaymentStatus(orderId : Nat, newStatus : PaymentStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with paymentStatus = newStatus };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func setDeliveryTime(
    orderId : Nat,
    value : Nat,
    unit : TimeUnit,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set delivery time");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (order.status) {
          case (#shipped) {};
          case (#outForDelivery) {};
          case (#delivered) {};
          case (_) {
            Runtime.trap("Delivery time can only be set for shipped or delivered orders");
          };
        };

        let updatedOrder = {
          order with
          deliveryTime = ?{
            value;
            unit;
          }
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func markOrderAsPaid(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payment for their orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.customerPrincipal != caller) {
          Runtime.trap("Unauthorized: You can only confirm payment for your own orders");
        };
        if (order.paymentStatus != #pending) {
          Runtime.trap("Payment status can only be updated to paid if it is still pending");
        };
        let updatedOrder = { order with paymentStatus = #paid };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let ordersArray = orders.values().toArray();
    ordersArray.filter(
      func(order) { order.customerPrincipal == caller }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public type DeliveryAssignment = {
    assignedBy : Principal;
    timestamp : Time.Time;
  };

  type DeliveryAssignmentsMap = Map.Map<Principal, DeliveryAssignment>;
  let deliveryAssignments : DeliveryAssignmentsMap = Map.empty<Principal, DeliveryAssignment>();

  public shared ({ caller }) func assignDeliveryRole(deliveryPerson : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign delivery roles");
    };

    let assignment : DeliveryAssignment = {
      assignedBy = caller;
      timestamp = Time.now();
    };

    deliveryAssignments.add(deliveryPerson, assignment);
  };

  public query ({ caller }) func isDeliveryPerson() : async Bool {
    deliveryAssignments.containsKey(caller);
  };

  public shared ({ caller }) func updateOrderStatusByDeliveryPerson(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not (deliveryAssignments.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only delivery persons can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getActiveOrdersForDelivery() : async [Order] {
    if (not (deliveryAssignments.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only delivery persons can view active orders for delivery");
    };

    orders.values().toArray().filter(
      func(order) {
        switch (order.status) {
          case (#delivered) { false };
          case (#cancelled) { false };
          case (_) { true };
        };
      }
    );
  };

  // Approval endpoints from user-approval component
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // State maps from migration, must be kept at bottom
  type UserProfileMap = Map.Map<Principal, UserProfile>;
  let userProfiles : UserProfileMap = Map.empty<Principal, UserProfile>();
};
