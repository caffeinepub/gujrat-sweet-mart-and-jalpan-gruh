import {
  Edit2,
  Loader2,
  Plus,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_fixed_percentage } from "../backend";
import {
  useCreatePromoCode,
  useDeletePromoCode,
  useEditPromoCode,
  useGetAllPromoCodes,
  useTogglePromoCode,
} from "../hooks/usePromoCodes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

interface CouponFormData {
  code: string;
  discountType: Variant_fixed_percentage;
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  description: string;
  active: boolean;
}

const defaultFormData: CouponFormData = {
  code: "",
  discountType: Variant_fixed_percentage.percentage,
  discountValue: "",
  minOrderAmount: "0",
  maxUses: "0",
  description: "",
  active: true,
};

export default function CouponManagement() {
  const { data: promoCodes, isLoading } = useGetAllPromoCodes();
  const createPromoCode = useCreatePromoCode();
  const editPromoCode = useEditPromoCode();
  const deletePromoCode = useDeletePromoCode();
  const togglePromoCode = useTogglePromoCode();

  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);

  const isEditing = editingCode !== null;

  const handleOpenAdd = () => {
    setEditingCode(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleOpenEdit = (code: string) => {
    const promo = promoCodes?.find((p) => p.code === code);
    if (!promo) return;
    setEditingCode(code);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue).toString(),
      minOrderAmount: Number(promo.minOrderAmount).toString(),
      maxUses: Number(promo.maxUses).toString(),
      description: promo.description,
      active: promo.active,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCode(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = formData.code.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error("Coupon code is required");
      return;
    }
    const discountVal = Number(formData.discountValue);
    if (Number.isNaN(discountVal) || discountVal <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (
      formData.discountType === Variant_fixed_percentage.percentage &&
      discountVal > 100
    ) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    const minOrder = Number(formData.minOrderAmount) || 0;
    const maxUsesVal = Number(formData.maxUses) || 0;

    try {
      if (isEditing) {
        await editPromoCode.mutateAsync({
          code: trimmedCode,
          discountType: formData.discountType,
          discountValue: BigInt(Math.round(discountVal)),
          minOrderAmount: BigInt(minOrder),
          maxUses: BigInt(maxUsesVal),
          description: formData.description.trim(),
        });
        toast.success("Coupon updated successfully!");
      } else {
        await createPromoCode.mutateAsync({
          code: trimmedCode,
          discountType: formData.discountType,
          discountValue: BigInt(Math.round(discountVal)),
          minOrderAmount: BigInt(minOrder),
          maxUses: BigInt(maxUsesVal),
          description: formData.description.trim(),
        });
        toast.success("Coupon created successfully!");
      }
      handleCloseForm();
    } catch (error) {
      console.error("Failed to save promo code:", error);
      toast.error(
        isEditing ? "Failed to update coupon" : "Failed to create coupon",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCode) return;
    try {
      await deletePromoCode.mutateAsync(deleteConfirmCode);
      toast.success("Coupon deleted");
      setDeleteConfirmCode(null);
    } catch (error) {
      console.error("Failed to delete promo code:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggle = async (code: string) => {
    try {
      await togglePromoCode.mutateAsync(code);
      toast.success("Coupon status updated");
    } catch (error) {
      console.error("Failed to toggle promo code:", error);
      toast.error("Failed to update coupon status");
    }
  };

  const isSaving = createPromoCode.isPending || editPromoCode.isPending;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold">Coupon Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage discount codes for your customers.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-2"
          data-ocid="coupons.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add New Coupon
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="mb-8 bg-card border-2 border-primary/20 rounded-lg p-6"
            data-ocid="coupons.panel"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                {isEditing ? "Edit Coupon" : "Add New Coupon"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseForm}
                data-ocid="coupons.close_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-code">Coupon Code *</Label>
                  <Input
                    id="coupon-code"
                    placeholder="e.g. DIWALI20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    disabled={isEditing}
                    className="uppercase font-mono tracking-widest"
                    data-ocid="coupons.input"
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Code cannot be changed when editing
                    </p>
                  )}
                </div>

                {/* Discount Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-type">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountType: v as Variant_fixed_percentage,
                      }))
                    }
                  >
                    <SelectTrigger id="coupon-type" data-ocid="coupons.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Variant_fixed_percentage.percentage}>
                        Percentage (%)
                      </SelectItem>
                      <SelectItem value={Variant_fixed_percentage.fixed}>
                        Fixed Amount (₹)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Value */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-value">
                    Discount Value *{" "}
                    <span className="text-muted-foreground font-normal">
                      (
                      {formData.discountType ===
                      Variant_fixed_percentage.percentage
                        ? "%"
                        : "₹"}
                      )
                    </span>
                  </Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    min={1}
                    max={
                      formData.discountType ===
                      Variant_fixed_percentage.percentage
                        ? 100
                        : undefined
                    }
                    placeholder={
                      formData.discountType ===
                      Variant_fixed_percentage.percentage
                        ? "e.g. 20"
                        : "e.g. 50"
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountValue: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Min Order Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-min">
                    Minimum Order Amount (₹){" "}
                    <span className="text-muted-foreground font-normal">
                      (0 = no minimum)
                    </span>
                  </Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minOrderAmount: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Max Uses */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-max-uses">
                    Max Uses{" "}
                    <span className="text-muted-foreground font-normal">
                      (0 = unlimited)
                    </span>
                  </Label>
                  <Input
                    id="coupon-max-uses"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxUses: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-desc">Description</Label>
                  <Input
                    id="coupon-desc"
                    placeholder="e.g. Diwali special discount"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    data-ocid="coupons.textarea"
                  />
                </div>
              </div>

              {/* Active toggle (edit only) */}
              {isEditing && (
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    id="coupon-active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, active: checked }))
                    }
                    data-ocid="coupons.switch"
                  />
                  <Label htmlFor="coupon-active" className="cursor-pointer">
                    {formData.active ? "Active" : "Inactive"}
                  </Label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  data-ocid="coupons.submit_button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    "Update Coupon"
                  ) : (
                    "Create Coupon"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  data-ocid="coupons.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="coupons.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !promoCodes || promoCodes.length === 0 ? (
        <div
          className="text-center py-16 bg-card border-2 border-dashed border-primary/20 rounded-lg"
          data-ocid="coupons.empty_state"
        >
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">No Coupons Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first discount coupon to attract more customers.
          </p>
          <Button onClick={handleOpenAdd} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add First Coupon
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {promoCodes.map((promo, index) => (
            <motion.div
              key={promo.code}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`bg-card border-2 rounded-lg p-5 flex flex-wrap items-center gap-4 transition-opacity ${
                promo.active ? "border-primary/20" : "border-border opacity-60"
              }`}
              data-ocid={`coupons.item.${index + 1}`}
            >
              {/* Left: Code + Badge */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-lg tracking-widest uppercase">
                      {promo.code}
                    </span>
                    <Badge
                      className={
                        promo.active
                          ? "bg-green-100 text-green-800 border-green-300 border text-xs"
                          : "bg-gray-100 text-gray-600 border-gray-300 border text-xs"
                      }
                    >
                      {promo.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {promo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle: Details */}
              <div className="flex flex-wrap gap-4 flex-1 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Discount
                  </p>
                  <p className="font-bold text-primary text-base">
                    {promo.discountType === Variant_fixed_percentage.percentage
                      ? `${Number(promo.discountValue)}%`
                      : `₹${Number(promo.discountValue)}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Min Order
                  </p>
                  <p className="font-semibold">
                    {Number(promo.minOrderAmount) === 0
                      ? "—"
                      : `₹${Number(promo.minOrderAmount)}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Max Uses
                  </p>
                  <p className="font-semibold">
                    {Number(promo.maxUses) === 0
                      ? "Unlimited"
                      : Number(promo.maxUses)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Used
                  </p>
                  <p className="font-semibold">{Number(promo.usedCount)}</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  title={promo.active ? "Deactivate" : "Activate"}
                  onClick={() => handleToggle(promo.code)}
                  disabled={togglePromoCode.isPending}
                  className={
                    promo.active ? "text-green-600" : "text-muted-foreground"
                  }
                  data-ocid={`coupons.toggle.${index + 1}`}
                >
                  {promo.active ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit coupon"
                  onClick={() => handleOpenEdit(promo.code)}
                  data-ocid={`coupons.edit_button.${index + 1}`}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete coupon"
                  onClick={() => setDeleteConfirmCode(promo.code)}
                  className="text-destructive hover:text-destructive"
                  data-ocid={`coupons.delete_button.${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteConfirmCode}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmCode(null);
        }}
      >
        <AlertDialogContent data-ocid="coupons.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon{" "}
              <strong>{deleteConfirmCode}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="coupons.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="coupons.confirm_button"
            >
              {deletePromoCode.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
