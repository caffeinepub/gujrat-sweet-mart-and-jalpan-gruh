import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type ProductId = Nat;

  type OldCategory = {
    #sweets;
    #snacks;
    #namkeen;
  };

  type NewCategory = {
    #sweets;
    #snacks;
    #namkeen;
    #beverages;
  };

  type Unit = {
    #per_kg;
    #single;
  };

  type OldProduct = {
    id : ProductId;
    name : Text;
    category : OldCategory;
    description : Text;
    price : Nat;
    available : Bool;
  };

  type NewProduct = {
    id : ProductId;
    name : Text;
    category : NewCategory;
    description : Text;
    price : Nat;
    available : Bool;
    unit : Unit;
    photoUrl : Text;
  };

  type OldActor = {
    nextProductId : ProductId;
    products : Map.Map<ProductId, OldProduct>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    nextProductId : ProductId;
    products : Map.Map<ProductId, NewProduct>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<ProductId, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          unit = #single; // default to single unit for existing products
          photoUrl = ""; // default to empty string for existing products
        };
      }
    );
    { old with products = newProducts };
  };
};
