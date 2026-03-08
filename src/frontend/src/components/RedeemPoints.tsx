import { Coins, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMaxRedeemablePoints,
  useGetMyLoyaltyAccount,
} from "../hooks/useLoyalty";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RedeemPointsProps {
  orderTotal: bigint;
  onRedeem: (points: bigint, discount: number) => void;
  redeemedPoints: bigint;
}

export default function RedeemPoints({
  orderTotal,
  onRedeem,
  redeemedPoints,
}: RedeemPointsProps) {
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toText() ?? null;

  const { data: account, isLoading: accountLoading } = useGetMyLoyaltyAccount();
  const { data: maxRedeemable, isLoading: maxLoading } =
    useGetMaxRedeemablePoints(orderTotal, principalStr);

  const [inputValue, setInputValue] = useState("");

  const confirmedPoints = Number(account?.confirmedPoints ?? 0n);
  const maxPoints = Number(maxRedeemable ?? 0n);
  const currentRedeemed = Number(redeemedPoints);
  const discount = currentRedeemed / 10; // 10 pts = ₹1

  // Reset if order total changes significantly
  useEffect(() => {
    if (currentRedeemed > maxPoints) {
      onRedeem(0n, 0);
      setInputValue("");
    }
  }, [maxPoints, currentRedeemed, onRedeem]);

  const handleApply = () => {
    const pts = Number.parseInt(inputValue, 10);
    if (Number.isNaN(pts) || pts <= 0) return;
    const clamped = Math.min(pts, maxPoints, confirmedPoints);
    onRedeem(BigInt(clamped), clamped / 10);
  };

  const handleRemove = () => {
    onRedeem(0n, 0);
    setInputValue("");
  };

  if (!identity || confirmedPoints === 0) return null;

  const isLoading = accountLoading || maxLoading;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="h-4 w-4 text-amber-600" />
        <h4 className="font-semibold text-sm text-amber-900">
          Redeem Loyalty Points
        </h4>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading points...
        </div>
      ) : (
        <>
          <div className="text-xs text-amber-800 mb-3 space-y-0.5">
            <p>
              Available:{" "}
              <strong>{confirmedPoints.toLocaleString("en-IN")} points</strong>{" "}
              (≈ ₹{(confirmedPoints / 10).toFixed(2)})
            </p>
            {maxPoints > 0 && (
              <p>
                Max redeemable on this order:{" "}
                <strong>{maxPoints} points</strong> (≈ ₹
                {(maxPoints / 10).toFixed(2)})
              </p>
            )}
            <p className="text-amber-600">10 points = ₹1 discount</p>
          </div>

          {currentRedeemed > 0 ? (
            <div className="flex items-center justify-between bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
              <div className="text-sm">
                <span className="font-semibold text-amber-800">
                  {currentRedeemed} points applied
                </span>
                <span className="text-green-700 ml-2 font-bold">
                  -₹{discount.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-amber-600 hover:text-amber-800 transition-colors"
                aria-label="Remove points"
                data-ocid="redeem_points.cancel_button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="redeem-points-input" className="sr-only">
                  Points to redeem
                </Label>
                <Input
                  id="redeem-points-input"
                  type="number"
                  placeholder={`Max ${maxPoints} pts`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min={1}
                  max={maxPoints}
                  className="text-sm h-9"
                  data-ocid="redeem_points.input"
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                />
              </div>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={
                  !inputValue ||
                  Number.parseInt(inputValue) <= 0 ||
                  maxPoints === 0
                }
                className="bg-amber-600 hover:bg-amber-700 text-white h-9"
                data-ocid="redeem_points.submit_button"
              >
                Redeem
              </Button>
            </div>
          )}

          {maxPoints === 0 && confirmedPoints > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Points cannot be redeemed on this order (minimum order amount not
              met)
            </p>
          )}
        </>
      )}
    </div>
  );
}
