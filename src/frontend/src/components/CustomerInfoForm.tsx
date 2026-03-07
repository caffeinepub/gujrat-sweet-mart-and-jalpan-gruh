import { Check, Edit2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetCustomerProfile,
  useSaveCustomerProfile,
} from "../hooks/useCustomerProfile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface CustomerInfoFormProps {
  onProfileComplete: (profile: {
    name: string;
    phone: string;
    address: string;
  }) => void;
  hideAddress?: boolean;
}

export default function CustomerInfoForm({
  onProfileComplete,
  hideAddress = false,
}: CustomerInfoFormProps) {
  const { data: profile, isLoading } = useGetCustomerProfile();
  const saveProfile = useSaveCustomerProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setAddress(profile.address);
      onProfileComplete({
        name: profile.name,
        phone: profile.phone,
        address: hideAddress ? "STORE PICKUP" : profile.address,
      });
    } else {
      setIsEditing(true);
    }
  }, [profile, onProfileComplete, hideAddress]);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || (!hideAddress && !address.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }

    const effectiveAddress = hideAddress ? "STORE PICKUP" : address;

    try {
      await saveProfile.mutateAsync({ name, phone, address });
      setIsEditing(false);
      onProfileComplete({ name, phone, address: effectiveAddress });
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEditing && profile) {
    // When profile is loaded with hideAddress=true, ensure parent knows the effective address
    const displayAddress = hideAddress ? "STORE PICKUP" : profile.address;

    return (
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl">
            {hideAddress ? "Pickup Information" : "Delivery Information"}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            data-ocid="customer-info.edit_button"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Name:</span> {profile.name}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {profile.phone}
          </p>
          {!hideAddress && (
            <p>
              <span className="font-semibold">Address:</span> {displayAddress}
            </p>
          )}
          {hideAddress && (
            <p className="text-green-700 font-medium">
              📍 Store Pickup — no delivery address needed
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
      <h3 className="font-display font-bold text-xl mb-4">
        {hideAddress ? "Pickup Information" : "Delivery Information"}
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            data-ocid="customer-info.input"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            data-ocid="customer-info.input"
          />
        </div>
        {!hideAddress && (
          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address"
              rows={3}
              data-ocid="customer-info.textarea"
            />
          </div>
        )}
        {hideAddress && (
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm text-green-700">
            📍 You have selected <strong>Store Pickup</strong>. No delivery
            address needed.
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={saveProfile.isPending}
          className="w-full"
          data-ocid="customer-info.save_button"
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Information
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
