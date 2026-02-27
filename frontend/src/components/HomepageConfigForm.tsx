import { useState, useRef, useEffect } from 'react';
import { useGetHomepageConfig, useUpdateHomepageConfig } from '../hooks/useHomepageConfig';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, CheckCircle2, Image, Upload, AlertCircle, Home } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_ADDRESS = 'Visanji Nagar, Jaikisan Wadi, Jalgaon, Maharashtra 425001';
const DEFAULT_HOURS =
  'Monday–Sunday: 7 am–10 pm';
const DEFAULT_PHONE = '078751 99999';

export default function HomepageConfigForm() {
  const { data: config, isLoading } = useGetHomepageConfig();
  const updateConfig = useUpdateHomepageConfig();

  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoBytes, setLogoBytes] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setAddress(config.address || DEFAULT_ADDRESS);
      setHours(config.hours || DEFAULT_HOURS);
      setPhone(config.phone || DEFAULT_PHONE);
      const url = config.logo.getDirectURL();
      setLogoPreviewUrl(url);
    }
  }, [config]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG or JPG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(result) as Uint8Array<ArrayBuffer>;
        setLogoBytes(bytes);
        const blob = new Blob([bytes], { type: file.type });
        const previewUrl = URL.createObjectURL(blob);
        setLogoPreviewUrl(previewUrl);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    if (!logoBytes && !config?.logo) {
      toast.error('Please upload a logo image');
      return;
    }

    try {
      setSaveSuccess(false);
      await updateConfig.mutateAsync({
        logoBytes,
        existingLogo: config?.logo ?? null,
        address: address.trim(),
        hours: hours.trim(),
        phone: phone.trim(),
      });
      setSaveSuccess(true);
      setLogoBytes(null);
    } catch {
      // error handled in hook
    }
  };

  const isSaving = updateConfig.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl">Homepage Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Update the homepage logo/banner image and business information
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Homepage configuration saved successfully!</span>
        </div>
      )}

      {config && !saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Homepage is currently configured. You can update it below.</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <Label className="text-sm font-semibold mb-1.5 block">
            Homepage Logo / Banner Image
          </Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Preview */}
            <div className="w-48 h-32 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-muted/20 flex-shrink-0 overflow-hidden">
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center p-4">
                  <Image className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No logo uploaded</p>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {logoPreviewUrl ? 'Change Logo Image' : 'Upload Logo Image'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Accepted formats: PNG, JPG, WebP. Max size: 5MB. Recommended: 1200×400px.
              </p>
              {logoBytes && (
                <div className="flex items-center gap-1.5 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  New logo image selected
                </div>
              )}
              {!logoBytes && !config?.logo && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please upload a logo image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-semibold mb-1.5 block">
            Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter shop address"
            rows={2}
            disabled={isSaving}
          />
        </div>

        {/* Hours */}
        <div>
          <Label htmlFor="hours" className="text-sm font-semibold mb-1.5 block">
            Business Hours
          </Label>
          <Textarea
            id="hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. Monday–Sunday: 7 am–10 pm"
            rows={3}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can list each day separately or use a range (e.g. Monday–Sunday: 7 am–10 pm).
          </p>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold mb-1.5 block">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 078751 99999"
            disabled={isSaving}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !address.trim() || !phone.trim()}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Homepage Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
