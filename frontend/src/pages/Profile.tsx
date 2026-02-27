import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMyProfile, useSaveMyProfile } from '../hooks/useMyProfile';
import { DeliveryApprovalStatus } from '../backend';
import {
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Loader2,
  Truck,
  ShieldCheck,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import BackButton from '../components/BackButton';
import { toast } from 'sonner';

function DeliveryStatusBadge({ status }: { status: DeliveryApprovalStatus }) {
  switch (status) {
    case DeliveryApprovalStatus.approved:
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approved
        </Badge>
      );
    case DeliveryApprovalStatus.pending:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3.5 w-3.5" />
          Pending Approval
        </Badge>
      );
    case DeliveryApprovalStatus.rejected:
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useMyProfile();
  const saveProfile = useSaveMyProfile();

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toText() ?? '';

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setContactNumber(profile.contactNumber || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      toast.success('Principal ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
      });
      toast.success('Profile saved successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save profile');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground">You need to login to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-4xl font-display font-bold text-primary mb-8">My Profile</h1>

      {/* Principal ID Card */}
      <Card className="mb-6 border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Identity
          </CardTitle>
          <CardDescription>Your unique identifier on the Internet Computer</CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
            Principal ID
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 font-mono text-sm break-all">
              {principalId}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPrincipal}
              className="flex-shrink-0"
              title="Copy Principal ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this ID with the admin to get delivery access or other permissions.
          </p>
        </CardContent>
      </Card>

      {/* Delivery Access Status */}
      {profile && (
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery Access
            </CardTitle>
            <CardDescription>Status of your delivery dashboard access request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <DeliveryStatusBadge status={profile.deliveryApprovalStatus} />
            </div>
            {profile.deliveryApprovalStatus === DeliveryApprovalStatus.pending && (
              <p className="text-sm text-muted-foreground mt-3">
                Your request is pending admin review. You will be notified once approved.
              </p>
            )}
            {profile.deliveryApprovalStatus === DeliveryApprovalStatus.rejected && (
              <p className="text-sm text-muted-foreground mt-3">
                Your delivery access request was rejected. Please contact the admin for more information.
              </p>
            )}
            {profile.deliveryApprovalStatus === DeliveryApprovalStatus.approved && (
              <p className="text-sm text-muted-foreground mt-3">
                You have been approved for delivery access. You can now access the Delivery Dashboard.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* Profile Form */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={saveProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                disabled={saveProfile.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. you@example.com"
                disabled={saveProfile.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending || !fullName.trim()}
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
