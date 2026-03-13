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
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";


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
    #cookies;
    #accompaniments;
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

  stable var stableUpiConfig : ?UpiConfig = null;
  var upiConfig : ?UpiConfig = stableUpiConfig;

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
  stable var stableNextProductId : ProductId = 0;
  var nextProductId : ProductId = stableNextProductId;
  stable var stableProducts : [(ProductId, Product)] = [];
  let products : ProductMap = Map.empty<ProductId, ProductAlias>();

  public type DeliveryApprovalStatus = { #pending; #approved; #rejected };

  public type UserProfile = {
    fullName : Text;
    contactNumber : Text;
    email : Text;
    principalId : Principal;
    deliveryApprovalStatus : DeliveryApprovalStatus;
  };

  // State maps from migration, must be kept at bottom
  type UserProfileMap = Map.Map<Principal, UserProfile>;
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  let userProfiles : UserProfileMap = Map.empty<Principal, UserProfile>();

  // Username system: separate maps to avoid breaking stable storage
  // principal -> username
  stable var stableUsernames : [(Principal, Text)] = [];
  let usernames : Map.Map<Principal, Text> = Map.empty<Principal, Text>();
  // username (lowercased) -> principal (for uniqueness)
  stable var stableUsernameIndex : [(Text, Principal)] = [];
  let usernameIndex : Map.Map<Text, Principal> = Map.empty<Text, Principal>();

  public query func checkUsernameAvailable(username : Text) : async Bool {
    let lower = username.toLower();
    not (usernameIndex.containsKey(lower));
  };

  public shared ({ caller }) func setUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set a username");
    };

    // Length validation: must be more than 8 characters
    if (username.size() <= 8) {
      Runtime.trap("Username must be more than 8 characters long");
    };

    let lower = username.toLower();

    // Uniqueness check
    switch (usernameIndex.get(lower)) {
      case (?existingPrincipal) {
        if (existingPrincipal != caller) {
          Runtime.trap("This username is already occupied");
        };
        // Same caller re-setting same username is fine
      };
      case (null) {
        // Remove old username from index if caller already had one
        switch (usernames.get(caller)) {
          case (?oldUsername) {
            usernameIndex.remove(oldUsername.toLower());
          };
          case (null) {};
        };
      };
    };

    usernames.add(caller, username);
    usernameIndex.add(lower, caller);
  };

  public query ({ caller }) func getCallerUsername() : async ?Text {
    usernames.get(caller);
  };

  public query func getUsername(user : Principal) : async ?Text {
    usernames.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(fullName : Text, contactNumber : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingDeliveryStatus = switch (userProfiles.get(caller)) {
      case (?existing) { existing.deliveryApprovalStatus };
      case (null) { #pending };
    };

    let newProfile : UserProfile = {
      fullName;
      contactNumber;
      email;
      principalId = caller;
      deliveryApprovalStatus = existingDeliveryStatus;
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

    let profilesArr = userProfiles.values().toArray();
    profilesArr.filter(func(profile) { profile.deliveryApprovalStatus == #pending });
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
  stable var stableCustomerProfiles : [(Principal, CustomerProfile)] = [];
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

  // Coupon specific types and maps
  public type PromoCode = {
    code : Text;
    discountType : { #percentage; #fixed };
    discountValue : Nat;
    minOrderAmount : Nat;
    maxUses : Nat;
    usedCount : Nat;
    active : Bool;
    description : Text;
  };

  stable var stablePromoCodes : [(Text, PromoCode)] = [];
  var promoCodes : Map.Map<Text, PromoCode> = Map.empty<Text, PromoCode>();

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
    appliedPromoCode : ?Text;
    discountAmount : Nat;
  };

  public type OrderStatus = {
    #orderPlaced;
    #shipped;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  type OrderMap = Map.Map<Nat, Order>;
  stable var stableNextOrderId : Nat = 0;
  var nextOrderId = stableNextOrderId;
  stable var stableOrders : [(Nat, Order)] = [];
  let orders : OrderMap = Map.empty<Nat, Order>();

  stable var stableConfiguration : ?Stripe.StripeConfiguration = null;
  var configuration : ?Stripe.StripeConfiguration = stableConfiguration;

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

    let calculatedTotalPrice =
      switch (product.unit) {
        case (#per_kg) { (product.price * quantity) / 1000 };
        case (#single) { product.price * quantity };
      };

    cart.add({
      productId;
      quantity;
      totalPrice = calculatedTotalPrice;
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

  // Coupon (Promo code) management functions
  public shared ({ caller }) func createPromoCode(
    code : Text,
    discountType : { #percentage; #fixed },
    discountValue : Nat,
    minOrderAmount : Nat,
    maxUses : Nat,
    description : Text
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create promo codes");
    };

    let uppercaseCode = code.toUpper();
    let newPromoCode : PromoCode = {
      code = uppercaseCode;
      discountType;
      discountValue;
      minOrderAmount;
      maxUses;
      usedCount = 0;
      active = true;
      description;
    };

    promoCodes.add(uppercaseCode, newPromoCode);
  };

  public shared ({ caller }) func editPromoCode(
    code : Text,
    discountType : { #percentage; #fixed },
    discountValue : Nat,
    minOrderAmount : Nat,
    maxUses : Nat,
    description : Text
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit promo codes");
    };

    let uppercaseCode = code.toUpper();
    switch (promoCodes.get(uppercaseCode)) {
      case (null) { Runtime.trap("Promo code not found") };
      case (?existing) {
        let updatedPromoCode = {
          code = uppercaseCode;
          discountType;
          discountValue;
          minOrderAmount;
          maxUses;
          usedCount = existing.usedCount;
          active = existing.active;
          description;
        };
        promoCodes.add(uppercaseCode, updatedPromoCode);
      };
    };
  };

  public shared ({ caller }) func deletePromoCode(code : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete promo codes");
    };

    let uppercaseCode = code.toUpper();
    switch (promoCodes.get(uppercaseCode)) {
      case (null) { Runtime.trap("Promo code not found") };
      case (_) {
        promoCodes.remove(uppercaseCode);
      };
    };
  };

  public shared ({ caller }) func togglePromoCode(code : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can toggle promo codes");
    };

    let uppercaseCode = code.toUpper();
    switch (promoCodes.get(uppercaseCode)) {
      case (null) { Runtime.trap("Promo code not found") };
      case (?existing) {
        let updatedPromoCode = {
          existing with active = not existing.active
        };
        promoCodes.add(uppercaseCode, updatedPromoCode);
      };
    };
  };

  public query ({ caller }) func getAllPromoCodes() : async [PromoCode] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all promo codes");
    };
    promoCodes.values().toArray();
  };

  public query func validatePromoCode(
    code : Text,
    orderTotal : Nat,
  ) : async ?PromoCode {
    let uppercaseCode = code.toUpper();
    switch (promoCodes.get(uppercaseCode)) {
      case (null) { null };
      case (?promo) {
        if (
          not promo.active or
          orderTotal < promo.minOrderAmount or
          promo.usedCount >= promo.maxUses
        ) {
          null;
        } else { ?promo };
      };
    };
  };

  func calculateDiscount(orderTotal : Nat, promo : PromoCode) : Nat {
    switch (promo.discountType) {
      case (#percentage) {
        (orderTotal * promo.discountValue) / 100;
      };
      case (#fixed) { promo.discountValue };
    };
  };

  public shared ({ caller }) func createOrder(
    name : Text,
    phone : Text,
    address : Text,
    paymentMethod : { #cashOnDelivery; #online },
    promoCode : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can create orders");
    };

    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (cart.isEmpty()) {
      Runtime.trap("Cart is empty");
    };

    let orderId = nextOrderId;
    let items = cart.toArray();
    let orderTotal = items.foldLeft(0, func(acc, item) { acc + item.totalPrice });
    var discountAmount = 0;
    var appliedPromoCode : ?Text = null;
    let uppercasePromoCode = switch (promoCode) {
      case (null) { null };
      case (?code) { ?code.toUpper() };
    };

    switch (uppercasePromoCode) {
      case (null) {};
      case (?code) {
        switch (promoCodes.get(code)) {
          case (null) {};
          case (?promo) {
            if (
              promo.active and
              orderTotal >= promo.minOrderAmount and
              promo.usedCount < promo.maxUses
            ) {
              discountAmount := calculateDiscount(orderTotal, promo);
              appliedPromoCode := ?promo.code;
              let updatedPromo = {
                promo with
                usedCount = promo.usedCount + 1;
              };
              promoCodes.add(code, updatedPromo);
            };
          };
        };
      };
    };

    let newOrder : Order = {
      orderId;
      customerPrincipal = caller;
      name;
      phone;
      address;
      items;
      paymentMethod;
      status = #orderPlaced;
      paymentStatus = #pending;
      timestamp = Time.now();
      deliveryTime = null;
      appliedPromoCode;
      discountAmount;
    };

    orders.add(orderId, newOrder);
    shoppingCarts.remove(caller);
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
  stable var stableDeliveryAssignments : [(Principal, DeliveryAssignment)] = [];
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

  // Homepage config
  public type HomepageConfig = {
    logo : Storage.ExternalBlob;
    address : Text;
    hours : Text;
    phone : Text;
  };

  stable var stableHomepageConfig : ?HomepageConfig = null;
  var homepageConfig : ?HomepageConfig = stableHomepageConfig;

  public shared ({ caller }) func updateHomepageConfig(config : HomepageConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update homepage config");
    };
    homepageConfig := ?config;
  };

  public query ({ caller }) func getHomepageConfig() : async ?HomepageConfig {
    homepageConfig;
  };

  // Stable storage hooks - persist all data across canister upgrades
  system func preupgrade() {
    stableProducts := products.entries().toArray();
    stableNextProductId := nextProductId;
    stableUserProfiles := userProfiles.entries().toArray();
    stableCustomerProfiles := customerProfiles.entries().toArray();
    stablePromoCodes := promoCodes.entries().toArray();
    stableOrders := orders.entries().toArray();
    stableNextOrderId := nextOrderId;
    stableDeliveryAssignments := deliveryAssignments.entries().toArray();
    stableUpiConfig := upiConfig;
    stableConfiguration := configuration;
    stableHomepageConfig := homepageConfig;
    stableUsernames := usernames.entries().toArray();
    stableUsernameIndex := usernameIndex.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in stableProducts.vals()) {
      products.add(k, v);
    };
    nextProductId := stableNextProductId;

    for ((k, v) in stableUserProfiles.vals()) {
      userProfiles.add(k, v);
    };

    for ((k, v) in stableCustomerProfiles.vals()) {
      customerProfiles.add(k, v);
    };

    for ((k, v) in stablePromoCodes.vals()) {
      promoCodes.add(k, v);
    };

    for ((k, v) in stableOrders.vals()) {
      orders.add(k, v);
    };
    nextOrderId := stableNextOrderId;

    for ((k, v) in stableDeliveryAssignments.vals()) {
      deliveryAssignments.add(k, v);
    };

    upiConfig := stableUpiConfig;
    configuration := stableConfiguration;
    homepageConfig := stableHomepageConfig;

    for ((k, v) in stableUsernames.vals()) {
      usernames.add(k, v);
    };

    for ((k, v) in stableUsernameIndex.vals()) {
      usernameIndex.add(k, v);
    };
  };
};
