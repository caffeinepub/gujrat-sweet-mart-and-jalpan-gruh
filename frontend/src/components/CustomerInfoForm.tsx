import { useState, useEffect } from 'react';
import { useGetCustomerProfile, useSaveCustomerProfile } from '../hooks/useCustomerProfile';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInfoFormProps {
  onProfileComplete: (profile: { name: string; phone: string; address: string }) => void;
}

export default function CustomerInfoForm({ onProfileComplete }: CustomerInfoFormProps) {
  const { data: profile, isLoading } = useGetCustomerProfile();
  const saveProfile = useSaveCustomerProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setAddress(profile.address);
      onProfileComplete({ name: profile.name, phone: profile.phone, address: profile.address });
    } else {
      setIsEditing(true);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await saveProfile.mutateAsync({ name, phone, address });
      setIsEditing(false);
      onProfileComplete({ name, phone, address });
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
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
    return (
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl">Delivery Information</h3>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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
          <p>
            <span className="font-semibold">Address:</span> {profile.address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
      <h3 className="font-display font-bold text-xl mb-4">Delivery Information</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <Label htmlFor="address">Delivery Address *</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete delivery address"
            rows={3}
          />
        </div>
        <Button onClick={handleSave} disabled={saveProfile.isPending} className="w-full">
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
