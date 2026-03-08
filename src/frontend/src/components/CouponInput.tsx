import { Loader2, Tag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Variant_fixed_percentage } from "../backend";
import { useValidatePromoCode } from "../hooks/usePromoCodes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CouponInputProps {
  orderTotal: number; // in rupees (items + delivery)
  onApply: (code: string | null, discountAmount: number) => void;
  appliedCode: string | null;
  discountAmount: number;
}

export default function CouponInput({
  orderTotal,
  onApply,
  appliedCode,
  discountAmount,
}: CouponInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validatePromoCode = useValidatePromoCode();

  const handleApply = async () => {
    const code = inputValue.trim().toUpperCase();
    if (!code) {
      setError("Please enter a coupon code");
      return;
    }

    setError(null);

    try {
      const promo = await validatePromoCode.mutateAsync({
        code,
        orderTotal: BigInt(Math.round(orderTotal)),
      });

      if (!promo) {
        setError("Invalid or expired coupon code");
        return;
      }

      let discount = 0;
      if (promo.discountType === Variant_fixed_percentage.percentage) {
        discount = (orderTotal * Number(promo.discountValue)) / 100;
      } else {
        discount = Number(promo.discountValue);
      }

      // Discount cannot exceed order total
      discount = Math.min(discount, orderTotal);

      onApply(promo.code, Math.round(discount * 100) / 100);
      setInputValue("");
    } catch {
      setError("Failed to validate coupon. Please try again.");
    }
  };

  const handleRemove = () => {
    onApply(null, 0);
    setInputValue("");
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  // If a code is already applied, show the applied state
  if (appliedCode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="applied"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3"
          data-ocid="coupon.success_state"
        >
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-md">
              <Tag className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-300 border font-mono tracking-wider text-xs">
                  {appliedCode}
                </Badge>
                <span className="text-green-700 text-sm font-semibold">
                  Coupon applied!
                </span>
              </div>
              <p className="text-green-600 text-xs mt-0.5">
                You save ₹{discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-green-700 hover:text-red-600 hover:bg-red-50 h-7 w-7 flex-shrink-0"
            onClick={handleRemove}
            title="Remove coupon"
            data-ocid="coupon.delete_button"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-2" data-ocid="coupon.panel">
      <Label htmlFor="coupon-input" className="text-sm font-medium">
        Have a coupon code?
      </Label>
      <div className="flex gap-2">
        <Input
          id="coupon-input"
          placeholder="Enter coupon code"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          className="font-mono tracking-widest uppercase flex-1"
          data-ocid="coupon.input"
        />
        <Button
          variant="outline"
          onClick={handleApply}
          disabled={validatePromoCode.isPending || !inputValue.trim()}
          className="flex-shrink-0"
          data-ocid="coupon.primary_button"
        >
          {validatePromoCode.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-destructive flex items-center gap-1"
            data-ocid="coupon.error_state"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
