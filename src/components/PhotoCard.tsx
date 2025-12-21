import { useState, useRef, useEffect } from "react";

interface PhotoCardProps {
  src: string;
  title?: string;
  category?: string;
  onClick: () => void;
}

const PhotoCard = ({ src, title, category, onClick }: PhotoCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className="photo-card masonry-item group" 
      onClick={onClick}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-card animate-pulse" />
      )}
      
      {isVisible && (
        <img
          src={src}
          alt={title || "Photography by Mostafavision"}
          loading="lazy"
          className={`rounded-sm transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
      
      {/* Hover Overlay with Title */}
      <div className="photo-overlay flex flex-col justify-end p-4 md:p-6">
        {category && (
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {category}
          </span>
        )}
        {title && (
          <span className="text-base md:text-lg font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 font-serif">
            {title}
          </span>
        )}
      </div>

      {/* Border highlight on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-sm transition-colors duration-300 pointer-events-none" />
    </div>
  );
};

export default PhotoCard;
