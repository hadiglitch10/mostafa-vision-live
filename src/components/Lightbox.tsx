import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: string;
  image_url: string;
  title?: string | null;
  category?: string | null;
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
  const [isAnimating, setIsAnimating] = useState(false);

  const currentPhoto = photos[currentIndex];
  const minSwipeDistance = 50;

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, photos.length, onNavigate, isAnimating]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, photos.length, onNavigate, isAnimating]);

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
    <div 
      className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
        aria-label="Close lightbox"
      >
        <X size={28} />
      </button>

      {/* Navigation - Desktop */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-4 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center"
        aria-label="Previous photo"
      >
        <ChevronLeft size={48} strokeWidth={1} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-4 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center"
        aria-label="Next photo"
      >
        <ChevronRight size={48} strokeWidth={1} />
      </button>

      {/* Image Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 md:p-20"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={currentPhoto.image_url}
          alt={currentPhoto.title || "Photo by Mostafavision"}
          className="max-w-full max-h-full object-contain transition-all duration-500 ease-out"
          style={{
            animation: 'scaleIn 0.3s ease-out forwards'
          }}
        />
      </div>

      {/* Photo Info - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none">
        <div className="container flex items-end justify-between">
          <div>
            {currentPhoto.category && (
              <span className="text-xs uppercase tracking-[0.2em] text-primary">
                {currentPhoto.category}
              </span>
            )}
            {currentPhoto.title && (
              <p className="text-foreground font-medium text-lg mt-1">{currentPhoto.title}</p>
            )}
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-border/30">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / photos.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Lightbox;
