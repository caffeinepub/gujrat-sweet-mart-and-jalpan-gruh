import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
  };

  type NewUserProfile = {
    fullName : Text;
    contactNumber : Text;
    email : Text;
    principalId : Principal.Principal;
    deliveryApprovalStatus : { #pending; #approved; #rejected };
  };

  type Actor = {
    products : Map.Map<Nat, {
      id : Nat;
      name : Text;
      category : {
        #sweets;
        #snacks;
        #namkeen;
        #beverages;
      };
      description : Text;
      price : Nat;
      available : Bool;
      unit : { #per_kg; #single };
      photoUrl : Text;
    }>;
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
  };

  public func run(old : Actor) : {
    products : Map.Map<Nat, {
      id : Nat;
      name : Text;
      category : {
        #sweets;
        #snacks;
        #namkeen;
        #beverages;
      };
      description : Text;
      price : Nat;
      available : Bool;
      unit : { #per_kg; #single };
      photoUrl : Text;
    }>;
    userProfiles : Map.Map<Principal.Principal, NewUserProfile>;
  } {
    let newUserProfiles = old.userProfiles.map<Principal.Principal, OldUserProfile, NewUserProfile>(
      func(principal, oldProfile) {
        {
          fullName = oldProfile.name;
          contactNumber = "";
          email = "";
          principalId = principal;
          deliveryApprovalStatus = #pending;
        };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
