import { Link } from "@tanstack/react-router";
import { CheckCircle, MessageCircle, PackagePlus } from "lucide-react";
import { useState } from "react";
import BackButton from "../components/BackButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const DEFAULT_WHATSAPP = "917875199999";

function getWhatsAppNumber(): string {
  return localStorage.getItem("shop_whatsapp_number") || DEFAULT_WHATSAPP;
}

interface FormState {
  name: string;
  phone: string;
  itemsDescription: string;
  notes: string;
}

export default function BulkOrder() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    itemsDescription: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.itemsDescription.trim())
      newErrors.itemsDescription = "Please describe what you need";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const number = getWhatsAppNumber();
    const text = encodeURIComponent(
      `Hi, I would like to place a BULK ORDER.\n\nName: ${form.name}\nPhone: ${form.phone}\nItems: ${form.itemsDescription}${form.notes ? `\nNotes: ${form.notes}` : ""}`,
    );
    const url = `https://wa.me/${number}?text=${text}`;
    setWhatsappUrl(url);
    setSubmitted(true);
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-orange-500 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <PackagePlus className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Bulk Orders
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
              Perfect for weddings, festivals, corporate events, and family
              gatherings. Get the best prices on large quantities.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>

          {!submitted ? (
            <div className="bg-card border-2 border-primary/20 rounded-xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-primary mb-1">
                  Place a Bulk Order Enquiry
                </h2>
                <p className="text-muted-foreground text-sm">
                  Fill in the details below and we'll get back to you via
                  WhatsApp.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="bulk-name" className="font-semibold">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bulk-name"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g. Rajesh Patel"
                    autoComplete="name"
                    data-ocid="bulk_order.name_input"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-phone" className="font-semibold">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bulk-phone"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="e.g. 9876543210"
                    type="tel"
                    autoComplete="tel"
                    data-ocid="bulk_order.phone_input"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-items" className="font-semibold">
                    Items Description{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bulk-items"
                    value={form.itemsDescription}
                    onChange={handleChange("itemsDescription")}
                    placeholder="e.g. 5 kg Kaju Katli, 3 kg Ladoo, 2 kg Chakli for a wedding on 15th March..."
                    rows={4}
                    data-ocid="bulk_order.items_input"
                  />
                  {errors.itemsDescription && (
                    <p className="text-sm text-destructive">
                      {errors.itemsDescription}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-notes" className="font-semibold">
                    Additional Notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="bulk-notes"
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="Any special requests, packaging preferences, or delivery details..."
                    rows={3}
                    data-ocid="bulk_order.notes_input"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-ocid="bulk_order.submit_button"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Submit Bulk Order Request
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>
                  Already know what you want?{" "}
                  <Link
                    to="/products"
                    className="text-primary hover:underline font-medium"
                  >
                    Browse our products
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border-2 border-green-200 rounded-xl shadow-sm p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-display font-bold text-primary mb-2">
                Request Received!
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your bulk order enquiry has been prepared. Click the button
                below to send it directly to our WhatsApp — we'll get back to
                you as soon as possible.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="bulk_order.whatsapp_button"
              >
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Open WhatsApp to Send Order
                </Button>
              </a>

              <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                <p>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        phone: "",
                        itemsDescription: "",
                        notes: "",
                      });
                    }}
                  >
                    Submit another request
                  </button>
                  {" · "}
                  <Link to="/products" className="text-primary hover:underline">
                    Continue shopping
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Why Bulk Order section */}
          {!submitted && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Festival Orders",
                  desc: "Diwali, Eid, Christmas — bulk sweets for celebrations",
                },
                {
                  title: "Wedding & Events",
                  desc: "Large quantities with custom packaging available",
                },
                {
                  title: "Corporate Gifting",
                  desc: "Branded and premium hampers for your team",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="bg-primary/5 border border-primary/15 rounded-lg p-4 text-center"
                >
                  <h4 className="font-display font-semibold text-primary mb-1">
                    {title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
