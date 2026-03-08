import { Principal } from "@icp-sdk/core/principal";
import { Coins, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type LoyaltyAccount,
  useAdminAdjustPoints,
  useAdminGetLoyaltyAccount,
} from "../hooks/useLoyalty";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function AdminLoyalty() {
  const [principalInput, setPrincipalInput] = useState("");
  const [searchedPrincipal, setSearchedPrincipal] = useState<Principal | null>(
    null,
  );
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");

  const adminGetAccount = useAdminGetLoyaltyAccount();
  const adminAdjust = useAdminAdjustPoints();

  const handleSearch = async () => {
    const trimmed = principalInput.trim();
    if (!trimmed) {
      toast.error("Enter a Principal ID");
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(trimmed);
    } catch {
      toast.error("Invalid Principal ID format");
      return;
    }

    try {
      const result = await adminGetAccount.mutateAsync(principal);
      setAccount(result);
      setSearchedPrincipal(principal);
    } catch (error) {
      console.error("Failed to get loyalty account:", error);
      toast.error("Could not find loyalty account for that principal");
      setAccount(null);
    }
  };

  const handleAdjust = async () => {
    if (!searchedPrincipal) return;
    const deltaNum = Number.parseInt(delta);
    if (Number.isNaN(deltaNum)) {
      toast.error("Enter a valid point delta (positive or negative)");
      return;
    }
    if (!reason.trim()) {
      toast.error("Enter a reason for the adjustment");
      return;
    }

    try {
      await adminAdjust.mutateAsync({
        principal: searchedPrincipal,
        delta: BigInt(deltaNum),
        reason: reason.trim(),
      });
      toast.success(
        `Points adjusted by ${deltaNum > 0 ? "+" : ""}${deltaNum} for this customer`,
      );
      // Refresh account
      const updated = await adminGetAccount.mutateAsync(searchedPrincipal);
      setAccount(updated);
      setDelta("");
      setReason("");
    } catch (error) {
      console.error("Failed to adjust points:", error);
      toast.error("Failed to adjust loyalty points");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold mb-1">
          Loyalty Points Management
        </h2>
        <p className="text-muted-foreground text-sm">
          Look up a customer's loyalty account by their Principal ID and adjust
          points.
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border-2 border-primary/20 rounded-lg p-6 mb-6">
        <Label
          htmlFor="principal-search"
          className="text-sm font-semibold mb-2 block"
        >
          Customer Principal ID
        </Label>
        <div className="flex gap-3">
          <Input
            id="principal-search"
            placeholder="e.g. 2vxsx-fae or a longer principal..."
            value={principalInput}
            onChange={(e) => setPrincipalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono text-sm"
            data-ocid="admin_loyalty.search_input"
          />
          <Button
            onClick={handleSearch}
            disabled={adminGetAccount.isPending}
            data-ocid="admin_loyalty.primary_button"
          >
            {adminGetAccount.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Account Info */}
      {account && searchedPrincipal && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Loyalty Account</p>
                <p className="text-xs text-amber-700 font-mono">
                  {searchedPrincipal.toText().slice(0, 20)}...
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {account.confirmedPoints.toString()}
                </p>
                <p className="text-sm text-amber-800 font-medium mt-1">
                  Confirmed Points
                </p>
                <p className="text-xs text-muted-foreground">
                  = ₹{(Number(account.confirmedPoints) / 10).toFixed(2)}{" "}
                  discount
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {account.pendingPoints.toString()}
                </p>
                <p className="text-sm text-orange-800 font-medium mt-1">
                  Pending Points
                </p>
                <p className="text-xs text-muted-foreground">
                  Awaiting delivery
                </p>
              </div>
            </div>
          </div>

          {/* Adjust Points */}
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Adjust Points</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="delta-input" className="text-sm mb-1.5 block">
                  Points Delta{" "}
                  <span className="text-muted-foreground text-xs">
                    (use negative to deduct, e.g. -50)
                  </span>
                </Label>
                <Input
                  id="delta-input"
                  type="number"
                  placeholder="e.g. 100 or -50"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  data-ocid="admin_loyalty.input"
                />
              </div>
              <div>
                <Label htmlFor="reason-input" className="text-sm mb-1.5 block">
                  Reason
                </Label>
                <Textarea
                  id="reason-input"
                  placeholder="e.g. Bonus for festival, manual correction..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  data-ocid="admin_loyalty.textarea"
                />
              </div>
              <Button
                onClick={handleAdjust}
                disabled={
                  adminAdjust.isPending || !delta.trim() || !reason.trim()
                }
                className="w-full"
                data-ocid="admin_loyalty.submit_button"
              >
                {adminAdjust.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adjusting...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Apply Adjustment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!account && !adminGetAccount.isPending && (
        <div className="text-center py-8 text-muted-foreground">
          <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Search for a customer principal to view their loyalty account
          </p>
        </div>
      )}
    </div>
  );
}
