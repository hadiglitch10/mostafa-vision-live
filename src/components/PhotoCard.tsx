import { useState, useRef, useEffect } from "react";
import { Video } from "lucide-react";

interface PhotoCardProps {
  src: string;
  title?: string;
  category?: string;
  aspectRatio?: string | null;
  onClick: () => void;
  priority?: boolean;
}

const PhotoCard = ({ src, title, category, aspectRatio = "4/5", onClick, priority = false }: PhotoCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="photo-card masonry-item group w-full bg-muted rounded-lg relative overflow-hidden cursor-pointer"
      style={{ aspectRatio: aspectRatio || "4/5" }}
      onClick={onClick}
    >
      {/* Skeleton loader */}
      {isVisible ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-card animate-pulse flex items-center justify-center">
              {!src && <Video size={32} className="opacity-10" />}
            </div>
          )}
          <img
            src={src}
            alt={title || "Photography by Mustafavision"}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110 will-change-transform`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)} // Treat error as loaded to show whatever placeholder exists
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-card flex items-center justify-center">
          <Video size={32} className="opacity-10" />
        </div>
      )}

      {/* Hover Overlay with Title */}
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4 md:p-6">
        <div className="flex flex-col justify-end w-full">
          {category && (
            <span className="text-xs uppercase tracking-[0.2em] text-primary mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 font-typewriter">
              {category}
            </span>
          )}
          {title && (
            <span className="text-base md:text-lg font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 font-heading">
              {title}
            </span>
          )}
        </div>
      </div>

      {/* Border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-colors duration-300 pointer-events-none" />
    </div>
  );
};

export default PhotoCard;
