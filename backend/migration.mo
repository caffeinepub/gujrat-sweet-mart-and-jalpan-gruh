import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";

module {
  type ProductId = Nat;

  type Category = {
    #sweets;
    #snacks;
    #namkeen;
    #beverages;
  };

  type Unit = {
    #per_kg;
    #single;
  };

  type Product = {
    id : ProductId;
    name : Text;
    category : Category;
    description : Text;
    price : Nat;
    available : Bool;
    unit : Unit;
    photoUrl : Text;
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
    totalPrice : Nat;
  };

  type CustomerProfile = {
    principal : Principal;
    name : Text;
    phone : Text;
    address : Text;
  };

  type OldOrder = {
    orderId : Nat;
    customerPrincipal : Principal;
    name : Text;
    phone : Text;
    address : Text;
    items : [CartItem];
    paymentMethod : { #cashOnDelivery; #online };
    status : { #orderPlaced; #shipped; #outForDelivery; #delivered; #cancelled };
    timestamp : Time.Time;
  };

  type NewOrder = {
    orderId : Nat;
    customerPrincipal : Principal;
    name : Text;
    phone : Text;
    address : Text;
    items : [CartItem];
    paymentMethod : { #cashOnDelivery; #online };
    status : { #orderPlaced; #shipped; #outForDelivery; #delivered; #cancelled };
    paymentStatus : { #pending; #paid; #refunded; #failed };
    timestamp : Time.Time;
    deliveryTime : ?{
      value : Nat;
      unit : { #minutes; #hours; #days };
    };
  };

  type OldActor = {
    products : Map.Map<ProductId, Product>;
    shoppingCarts : Map.Map<Principal, List.List<CartItem>>;
    customerProfiles : Map.Map<Principal, CustomerProfile>;
    orders : Map.Map<Nat, OldOrder>;
    nextOrderId : Nat;
  };

  type NewActor = {
    products : Map.Map<ProductId, Product>;
    shoppingCarts : Map.Map<Principal, List.List<CartItem>>;
    customerProfiles : Map.Map<Principal, CustomerProfile>;
    orders : Map.Map<Nat, NewOrder>;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          paymentStatus = #pending;
          deliveryTime = null;
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
