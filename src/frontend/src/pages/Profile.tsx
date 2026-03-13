import {
  AtSign,
  Check,
  Clock,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeliveryApprovalStatus } from "../backend";
import BackButton from "../components/BackButton";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useSaveMyProfile } from "../hooks/useMyProfile";
import {
  useCallerUsername,
  useCheckUsernameAvailable,
  useSetUsername,
} from "../hooks/useUsername";

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
  const { data: currentUsername, isLoading: usernameLoading } =
    useCallerUsername();
  const setUsernameMutation = useSetUsername();
  const checkUsernameAvailable = useCheckUsernameAvailable();

  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");

  // Username edit state
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setContactNumber(profile.contactNumber || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const validateUsernameLocal = (val: string): string => {
    if (val.length === 0) return "";
    if (val.length <= 8) return "Username must be more than 8 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val))
      return "Only letters, numbers and underscores allowed";
    return "";
  };

  const handleUsernameChange = (val: string) => {
    setNewUsername(val);
    setUsernameError(validateUsernameLocal(val));
  };

  const handleSaveUsername = async () => {
    const localErr = validateUsernameLocal(newUsername);
    if (localErr) {
      setUsernameError(localErr);
      return;
    }
    try {
      const available = await checkUsernameAvailable(newUsername);
      if (!available) {
        setUsernameError("This username is already occupied");
        return;
      }
      await setUsernameMutation.mutateAsync(newUsername.trim());
      setEditingUsername(false);
      setNewUsername("");
      toast.success("Username updated!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already occupied")) {
        setUsernameError("This username is already occupied");
      } else {
        toast.error(message || "Failed to update username");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
      });
      toast.success("Profile saved successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Please Login</h2>
          <p className="text-muted-foreground">
            You need to login to view your profile
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || usernameLoading) {
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
      <h1 className="text-4xl font-display font-bold text-primary mb-8">
        My Profile
      </h1>

      {/* Username / Identity Card */}
      <Card className="mb-6 border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AtSign className="h-5 w-5 text-primary" />
            Your Username
          </CardTitle>
          <CardDescription>
            Your public identity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!editingUsername ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted/50 rounded-md px-4 py-3">
                {currentUsername ? (
                  <span className="text-xl font-semibold text-primary">
                    @{currentUsername}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-sm">
                    No username set yet
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setNewUsername("");
                  setUsernameError("");
                  setEditingUsername(true);
                }}
                title="Change username"
                data-ocid="profile.username.edit_button"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                value={newUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="New username (min. 9 characters)"
                data-ocid="profile.username.input"
              />
              {usernameError && (
                <p
                  className="text-red-500 text-sm"
                  data-ocid="profile.username.error_state"
                >
                  {usernameError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveUsername}
                  disabled={
                    setUsernameMutation.isPending ||
                    newUsername.length <= 8 ||
                    !!usernameError
                  }
                  data-ocid="profile.username.save_button"
                >
                  {setUsernameMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingUsername(false)}
                  data-ocid="profile.username.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Usernames must be more than 8 characters and can contain letters,
            numbers, and underscores.
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
            <CardDescription>
              Status of your delivery dashboard access request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <DeliveryStatusBadge status={profile.deliveryApprovalStatus} />
            </div>
            {profile.deliveryApprovalStatus ===
              DeliveryApprovalStatus.pending && (
              <p className="text-sm text-muted-foreground mt-3">
                Your request is pending admin review. You will be notified once
                approved.
              </p>
            )}
            {profile.deliveryApprovalStatus ===
              DeliveryApprovalStatus.rejected && (
              <p className="text-sm text-muted-foreground mt-3">
                Your delivery access request was rejected. Please contact the
                admin for more information.
              </p>
            )}
            {profile.deliveryApprovalStatus ===
              DeliveryApprovalStatus.approved && (
              <p className="text-sm text-muted-foreground mt-3">
                You have been approved for delivery access. You can now access
                the Delivery Dashboard.
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
                data-ocid="profile.fullname.input"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contactNumber"
                className="flex items-center gap-1.5"
              >
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
                data-ocid="profile.contact.input"
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
                data-ocid="profile.email.input"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending || !fullName.trim()}
              data-ocid="profile.save.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
