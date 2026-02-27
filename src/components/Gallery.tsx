import { useState } from "react";
import PhotoCard from "./PhotoCard";
import Lightbox from "./Lightbox";
import { Photo } from "@/hooks/usePhotos";
import { Video } from "@/hooks/useVideos";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Loader2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type MediaItem = (Photo & { type: 'photo' }) | (Video & { type: 'video' });

interface StackSectionProps {
  number: string;
  title: string;
  subtitle: string;
  items: MediaItem[];
  onOpenLightbox: (index: number) => void;
  isAdmin: boolean;
  onAddPhoto: () => void;
  isMobileStack?: boolean;
}

// Reusable Collage/Masonry Section Component (Desktop Only)
const CollageSection = ({
  number,
  title,
  subtitle,
  items,
  onOpenLightbox,
  isAdmin,
  onAddPhoto
}: StackSectionProps) => {
  return (
    <div className="py-20 md:py-32 container relative hidden md:block">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 relative z-10">
        <div className="text-center md:text-left">
          {/* Number Background */}
          <div className="absolute top-[-4rem] left-[-2rem] text-[8rem] md:text-[12rem] font-bold text-foreground/5 select-none -z-10 font-heading italic leading-none">
            {number}
          </div>

          <h3 className="text-4xl md:text-6xl font-normal font-typewriter uppercase tracking-tighter text-foreground bg-background/50 backdrop-blur-sm p-2 rounded-lg inline-block">
            {title}
          </h3>
          <div className="block mt-2">
            <p className="font-typewriter text-sm tracking-widest text-muted-foreground bg-background/50 backdrop-blur-sm p-1 inline-block">
              {subtitle}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onAddPhoto}
            className="mt-6 md:mt-0 p-3 rounded-full bg-foreground text-background hover:scale-110 transition-transform shadow-lg group active:scale-95"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </div>

      {/* Masonry Grid - Desktop */}
      {items.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-6 space-y-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="break-inside-avoid relative group overflow-hidden rounded-sm cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => onOpenLightbox(index)}
            >
              <PhotoCard
                src={item.type === 'photo' ? item.image_url : (item.thumbnail_url || '')}
                title={item.title ?? undefined}
                category={item.category ?? undefined}
                onClick={() => onOpenLightbox(index)}
                priority={index < 3}
              />

              {/* Video Indicator */}
              {item.type === 'video' && (
                <div className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                  <Play size={16} fill="currentColor" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-muted-foreground/20 rounded-lg">
          <p className="font-typewriter text-muted-foreground">No content in {title} yet.</p>
        </div>
      )}
    </div>
  );
}

// 3D Stack / Card Component (Mobile Optimized)
const StackSection = ({
  number,
  title,
  subtitle,
  items,
  onOpenLightbox,
  isAdmin,
  onAddPhoto,
}: StackSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < items.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 700);
    }

    if (isRightSwipe && currentIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 700);
    }
  };

  return (
    <div className="pt-28 pb-16 container relative min-h-[600px] flex flex-col items-center justify-center gap-8">
      {/* Mobile Header */}
      <div className="relative z-10 max-w-md text-center">
        <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 text-[6rem] font-bold text-foreground/5 select-none -z-10 font-heading italic leading-none whitespace-nowrap">
          {number}
        </div>

        <h3 className="text-4xl font-normal font-typewriter uppercase tracking-tighter text-foreground bg-background/50 backdrop-blur-sm p-2 rounded-lg inline-block">
          {title}
        </h3>
        <div className="block mt-2">
          <p className="font-typewriter text-[10px] tracking-widest text-muted-foreground bg-background/50 backdrop-blur-sm p-1 inline-block">
            {subtitle}
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 flex justify-center">
            <button onClick={onAddPhoto} className="p-3 rounded-full bg-foreground text-background shadow-lg">
              <Plus size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Premium 3D Stack - Swipeable */}
      <div
        className="relative w-[82vw] max-w-sm h-[420px] perspective-1000 mt-2 mx-auto touch-pan-y overflow-visible"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.length > 0 ? (
          items.map((item, index) => {
            const position = index - currentIndex;

            if (position < -1 || position > 4) return null;

            const isSwiped = position < 0;

            return (
              <div
                key={item.id}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group ${isSwiped ? 'pointer-events-none' : ''
                  }`}
                style={{
                  transform: isSwiped
                    ? `translate3d(-120%, ${position * 8}px, -${Math.abs(position) * 30}px) rotate(-15deg)`
                    : `translate3d(${position * 2}px, ${position * 8}px, -${position * 30}px) rotate(${position % 2 === 0 ? -3 : 3}deg)`,
                  zIndex: 50 - position,
                  opacity: isSwiped ? 0 : Math.max(0, 1 - position * 0.1),
                }}
                onClick={() => !isSwiped && onOpenLightbox(index)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:bg-white/5 md:backdrop-blur-md bg-[#111] border border-white/10 ring-1 ring-white/20 will-change-transform">
                  <div className="absolute inset-0 z-10 bg-gradient-to-tr from-white/20 to-transparent opacity-50 pointer-events-none" />
                  <PhotoCard
                    src={item.type === 'photo' ? item.image_url : (item.thumbnail_url || '')}
                    title={item.title ?? undefined}
                    category={item.category ?? undefined}
                    aspectRatio="4/5"
                    onClick={() => !isSwiped && onOpenLightbox(index)}
                  />

                  {/* Video Indicator */}
                  {item.type === 'video' && (
                    <div className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                      <Play size={16} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
            <p className="font-typewriter text-muted-foreground text-xs">No photos</p>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {items.length > 0 && (
        <div className="flex gap-2 justify-center mt-4">
          {items.slice(0, Math.min(items.length, 10)).map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-1 bg-muted-foreground/30'
                }`}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <span className="text-[10px] font-typewriter tracking-widest text-muted-foreground uppercase opacity-50">
          Swipe to Browse • Tap to View
        </span>
      </div>
    </div>
  );
};

interface GalleryProps {
  photos: Photo[];
  videos: Video[];
}

const Gallery = ({ photos, videos }: GalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentSectionItems, setCurrentSectionItems] = useState<MediaItem[]>([]);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Combine media items
  const allMedia: MediaItem[] = [
    ...photos.map(p => ({ ...p, type: 'photo' as const })),
    ...videos.map(v => ({ ...v, type: 'video' as const }))
  ].sort((a, b) => {
    // Both tables have sort_order and created_at
    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Build section map dynamically from DB categories
  const sectionMap = categories.reduce((acc, cat, idx) => {
    const sectionItems = allMedia.filter(m => m.section === cat.value || (!m.section && cat.value === categories[0]?.value));
    acc[cat.value] = {
      cat,
      number: String(idx + 1).padStart(2, '0'),
      items: sectionItems,
    };
    return acc;
  }, {} as Record<string, { cat: typeof categories[0]; number: string; items: MediaItem[] }>);

  const openLightbox = (sectionItems: MediaItem[], index: number) => {
    setCurrentSectionItems(sectionItems);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleAddPhoto = () => {
    navigate('/admin');
  };

  const hasMedia = allMedia.length > 0;

  if (categoriesLoading) {
    return (
      <div className="container flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section id="gallery" className="relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-background to-background pointer-events-none -z-10" />

      {hasMedia || isAuthenticated ? (
        <div className="space-y-0 divide-y divide-border/20">
          {categories.map((cat, idx) => {
            const entry = sectionMap[cat.value];
            if (!entry) return null;
            const { number, items: sectionItems } = entry;

            // Skip empty sections for non-admin visitors
            if (!isAuthenticated && sectionItems.length === 0) return null;

            return (
              <div key={cat.value}>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <CollageSection
                    number={number}
                    title={cat.label}
                    subtitle={cat.subtitle || ''}
                    items={sectionItems}
                    onOpenLightbox={(index) => openLightbox(sectionItems, index)}
                    isAdmin={isAuthenticated}
                    onAddPhoto={handleAddPhoto}
                  />
                </div>
                {/* Mobile View */}
                <div className="md:hidden">
                  <StackSection
                    number={number}
                    title={cat.label}
                    subtitle={cat.subtitle || ''}
                    items={sectionItems}
                    onOpenLightbox={(index) => openLightbox(sectionItems, index)}
                    isAdmin={isAuthenticated}
                    onAddPhoto={handleAddPhoto}
                    isMobileStack={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="container text-center py-40 text-muted-foreground">
          <p className="text-2xl font-light font-typewriter">No content uploaded yet.</p>
          <p className="text-base mt-4 text-primary font-typewriter">Use the admin portal to publish your work.</p>
        </div>
      )}

      <Lightbox
        items={currentSectionItems}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentPhotoIndex}
      />
    </section>
  );
};

export default Gallery;
