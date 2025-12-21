import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  image_url: string;
  title?: string;
  category?: string;
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox = ({ photos, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentPhoto = photos[currentIndex];
  const minSwipeDistance = 50;

  const handlePrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  }, [currentIndex, photos.length, onNavigate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  }, [isOpen, onClose, handlePrev, handleNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown, isOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close lightbox"
      >
        <X size={28} />
      </button>

      {/* Navigation */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
        aria-label="Previous photo"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-muted-foreground hover:text-foreground transition-colors hidden md:block"
        aria-label="Next photo"
      >
        <ChevronRight size={40} />
      </button>

      {/* Image Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 md:p-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={currentPhoto.image_url}
          alt={currentPhoto.title || "Photo by Mostafavision"}
          className="max-w-full max-h-full object-contain animate-scale-in"
        />
      </div>

      {/* Photo Info */}
      <div className="absolute bottom-6 left-0 right-0 text-center animate-fade-up">
        {currentPhoto.category && (
          <span className="text-xs uppercase tracking-[0.2em] text-primary">
            {currentPhoto.category}
          </span>
        )}
        {currentPhoto.title && (
          <p className="text-foreground font-medium mt-1">{currentPhoto.title}</p>
        )}
        <p className="text-muted-foreground text-sm mt-2">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
};

export default Lightbox;
