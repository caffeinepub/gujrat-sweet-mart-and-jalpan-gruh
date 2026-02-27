import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        bg-primary/10 text-primary border border-primary/20
        hover:bg-primary/20 hover:border-primary/40
        active:scale-95 transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
