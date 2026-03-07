import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const DEFAULT_WHATSAPP = "917875199999";

export default function BulkOrderSettings() {
  const stored =
    localStorage.getItem("shop_whatsapp_number") || DEFAULT_WHATSAPP;
  const [number, setNumber] = useState(stored);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const trimmed = number.trim();
    if (!trimmed) {
      toast.error("Please enter a WhatsApp number");
      return;
    }
    setSaving(true);
    localStorage.setItem("shop_whatsapp_number", trimmed);
    setTimeout(() => {
      setSaving(false);
      toast.success("WhatsApp number saved successfully");
    }, 400);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">
          Bulk Order Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Configure the WhatsApp number used for bulk order enquiries.
        </p>
      </div>

      <div className="bg-card border-2 border-primary/20 rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="whatsapp-number" className="font-semibold">
            Shop WhatsApp Number
          </Label>
          <Input
            id="whatsapp-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="917875199999"
            data-ocid="bulk_settings.number_input"
          />
          <p className="text-xs text-muted-foreground">
            Enter the number with country code, no spaces or dashes (e.g.{" "}
            <span className="font-mono font-semibold">917875199999</span> for
            India +91 78751 99999).
          </p>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
          <p className="font-semibold mb-1">How it works</p>
          <p>
            When a customer submits a bulk order request, a pre-filled WhatsApp
            message with their order details will be sent to this number.
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <p className="font-medium text-muted-foreground">Current number:</p>
          <code className="block font-mono bg-muted px-3 py-2 rounded text-foreground">
            {stored}
          </code>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          data-ocid="bulk_settings.save_button"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Number
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
