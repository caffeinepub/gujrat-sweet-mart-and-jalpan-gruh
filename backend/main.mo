import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

// Apply migration with-clause.
(with migration = Migration.run)
actor {
  type ProductId = Nat;

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

  type ProductAlias = Product; // Alias for Map type inference
  var nextProductId : ProductId = 0;
  let products = Map.empty<ProductId, ProductAlias>();

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
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

  // New Shopping Cart, Orders and Delivery Backend Implementation

  public type CartItem = {
    productId : ProductId;
    quantity : Nat;
    totalPrice : Nat;
  };

  let shoppingCarts = Map.empty<Principal, List.List<CartItem>>();

  public type CustomerProfile = {
    principal : Principal;
    name : Text;
    phone : Text;
    address : Text;
  };

  let customerProfiles = Map.empty<Principal, CustomerProfile>();

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

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 0;

  // Stripe integration
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

  // Requires user-level auth to prevent anonymous abuse of HTTP outcalls
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  // Requires user-level auth since it creates a payment session on behalf of the caller
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

    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?items) { items };
    };

    let price = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product.price };
    };

    cart.add({
      productId;
      quantity;
      totalPrice = price * quantity;
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
};
