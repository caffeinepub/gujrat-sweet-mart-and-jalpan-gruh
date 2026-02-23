import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  type ProductId = Nat;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type UserProfile = {
    name : Text;
  };

  var nextProductId : ProductId = 0;
  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Debug utility to print all products
  public shared ({ caller }) func debugPrintProducts() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Debug.print("Unauthorized debug attempt by: " # debug_show (caller));
      Runtime.trap("Unauthorized: Only admins can debug products");
    };
    Debug.print("Current products: " # debug_show (products));
  };

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

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Category,
    description : Text,
    price : Nat,
    available : Bool,
    unit : Unit,
    photoUrl : Text,
  ) : async ProductId {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit products");
    };

    if (products.get(productId) == null) {
      Runtime.trap("Product not found");
    };

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

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (products.get(productId) == null) {
      Runtime.trap("Product not found");
    };

    products.remove(productId);
  };

  public query func getAllProducts() : async [Product] {
    products.toArray().map(func(entry) { entry.1 });
  };

  public query func getProduct(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    products.toArray().map(func(entry) { entry.1 }).filter(func(product) { product.category == category });
  };
};
