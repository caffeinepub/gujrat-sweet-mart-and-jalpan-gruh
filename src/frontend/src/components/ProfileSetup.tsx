import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInitializeUser } from "../hooks/useInitializeUser";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useUserProfile";
import {
  useCallerUsername,
  useCheckUsernameAvailable,
  useSetUsername,
} from "../hooks/useUsername";

export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    isError: profileError,
  } = useGetCallerUserProfile();
  const {
    data: existingUsername,
    isLoading: usernameLoading,
    isFetched: usernameFetched,
  } = useCallerUsername();
  const saveProfileMutation = useSaveCallerUserProfile();
  const setUsernameMutation = useSetUsername();
  const initializeUser = useInitializeUser();
  const checkUsernameAvailable = useCheckUsernameAvailable();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"full" | "username_only">("full");

  const isAuthenticated = !!identity;
  const isLoading = profileLoading || usernameLoading;
  const isFetched = profileFetched && usernameFetched;

  useEffect(() => {
    if (!isAuthenticated || isLoading || !isFetched) return;

    const noProfile = userProfile === null || profileError;
    const noUsername = !existingUsername;

    if (noProfile) {
      setMode("full");
      setIsOpen(true);
    } else if (noUsername) {
      setMode("username_only");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [
    isAuthenticated,
    isLoading,
    isFetched,
    userProfile,
    profileError,
    existingUsername,
  ]);

  const validateUsernameLocal = (val: string): string => {
    if (val.length === 0) return "";
    if (val.length <= 8) return "Username must be more than 8 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val))
      return "Only letters, numbers and underscores allowed";
    return "";
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setUsernameError(validateUsernameLocal(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    const localErr = validateUsernameLocal(username);
    if (localErr) {
      setUsernameError(localErr);
      return;
    }

    // Check availability
    try {
      const available = await checkUsernameAvailable(username);
      if (!available) {
        setUsernameError("This username is already occupied");
        return;
      }
    } catch {
      toast.error("Could not check username availability");
      return;
    }

    try {
      if (mode === "full") {
        if (!name.trim()) {
          toast.error("Name is required");
          return;
        }
        await initializeUser.mutateAsync("");
        await saveProfileMutation.mutateAsync({ fullName: name.trim() });
      }
      await setUsernameMutation.mutateAsync(username.trim());
      setIsOpen(false);
      toast.success("Profile setup complete!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already occupied")) {
        setUsernameError("This username is already occupied");
      } else {
        toast.error(message || "Failed to save profile");
      }
    }
  };

  if (!isOpen) return null;

  const isPending =
    initializeUser.isPending ||
    saveProfileMutation.isPending ||
    setUsernameMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-display font-bold text-primary mb-2">
          {mode === "full" ? "Welcome!" : "Choose a Username"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {mode === "full"
            ? "Set up your profile to get started."
            : "Pick a unique username to represent you on the platform."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "full" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Your Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Enter your full name"
                data-ocid="profile_setup.name.input"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username *{" "}
              <span className="text-muted-foreground font-normal">
                (min. 9 characters)
              </span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                usernameError ? "border-red-500" : ""
              }`}
              placeholder="e.g. sweetlover123"
              data-ocid="profile_setup.username.input"
            />
            {usernameError && (
              <p
                className="text-red-500 text-sm mt-1"
                data-ocid="profile_setup.username.error_state"
              >
                {usernameError}
              </p>
            )}
            {!usernameError && username.length > 8 && (
              <p className="text-green-600 text-sm mt-1">Looks good!</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isPending ||
              (mode === "full" && !name.trim()) ||
              username.length <= 8 ||
              !!usernameError
            }
            className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-ocid="profile_setup.submit_button"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
