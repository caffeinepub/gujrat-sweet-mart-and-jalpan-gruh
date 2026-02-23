import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Category = {
    #sweets;
    #snacks;
    #namkeen;
  };

  public type Product = {
    id : ProductId;
    name : Text;
    category : Category;
    description : Text;
    price : Nat;
    available : Bool;
  };

  public type ProductId = Nat;

  public type UserProfile = {
    name : Text;
  };

  var nextProductId : ProductId = 0;

  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  // Admin-only: Add Product
  public shared ({ caller }) func addProduct(name : Text, category : Category, description : Text, price : Nat, available : Bool) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    };

    products.add(productId, newProduct);
    nextProductId += 1;
    productId;
  };

  // Admin-only: Edit Product
  public shared ({ caller }) func editProduct(productId : ProductId, name : Text, category : Category, description : Text, price : Nat, available : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    let updatedProduct : Product = {
      id = productId;
      name;
      category;
      description;
      price;
      available;
    };

    products.add(productId, updatedProduct);
  };

  // Admin-only: Delete Product
  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    products.remove(productId);
  };

  // Public: Get all products (no authorization needed - guests can view)
  public query func getAllProducts() : async [Product] {
    products.toArray().map(func(entry : (ProductId, Product)) : Product { entry.1 });
  };

  // Public: Get product by ID (no authorization needed - guests can view)
  public query func getProduct(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  // Public: Get products by category (no authorization needed - guests can view)
  public query func getProductsByCategory(category : Category) : async [Product] {
    products.toArray()
      .map(func(entry : (ProductId, Product)) : Product { entry.1 })
      .filter(func(product : Product) : Bool { product.category == category });
  };
};
