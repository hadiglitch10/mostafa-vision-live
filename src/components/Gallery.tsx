import { useState, useRef, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import Lightbox from "./Lightbox";
import { Photo } from "@/hooks/usePhotos";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StackSectionProps {
  number: string;
  title: string;
  subtitle: string;
  photos: Photo[];
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
  photos,
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
      {photos.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid relative group overflow-hidden rounded-sm cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => onOpenLightbox(index)}
            >
              <PhotoCard
                src={photo.image_url}
                title={photo.title ?? undefined}
                category={photo.category ?? undefined}
                onClick={() => onOpenLightbox(index)}
                priority={index < 3}
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-muted-foreground/20 rounded-lg">
          <p className="font-typewriter text-muted-foreground">No photos in {title} yet.</p>
        </div>
      )}
    </div>
  );
}

// Reusable Tight Masonry (Desktop Only) - Kept for reference but not used currently per request
const TightMasonrySection = ({
  number,
  title,
  subtitle,
  photos,
  onOpenLightbox,
  isAdmin,
  onAddPhoto
}: StackSectionProps) => {
  return (
    <div className="py-20 md:py-32 container relative hidden md:block">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 relative z-10">
        <div className="text-center md:text-left">
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
          <button onClick={onAddPhoto} className="mt-6 md:mt-0 p-3 rounded-full bg-foreground text-background hover:scale-110 transition-transform shadow-lg group active:scale-95">
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}
      </div>

      {/* Tight Masonry Grid */}
      {photos.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid relative group overflow-hidden cursor-pointer rounded-lg shadow-sm"
              onClick={() => onOpenLightbox(index)}
            >
              <img
                src={photo.image_url}
                alt={photo.title || 'Event Photo'}
                className="w-full h-auto block hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-4">
                <p className="text-white font-typewriter text-xs tracking-widest uppercase">{photo.category || 'Event'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-muted-foreground/20 rounded-lg">
          <p className="font-typewriter text-muted-foreground">No photos in {title} yet.</p>
        </div>
      )}
    </div>
  );
}

// 3D Stack / Card Component (Mobile Optimized, but also works on Desktop if needed)
const StackSection = ({
  number,
  title,
  subtitle,
  photos,
  onOpenLightbox,
  isAdmin,
  onAddPhoto,
  isMobileStack = false
}: StackSectionProps) => {

  // On mobile, we force this component to show. On desktop, this might be hidden or used for Concerts.
  const visibilityClass = isMobileStack ? "block md:hidden" : "hidden md:block";

  return (
    <div className={`py-20 container relative min-h-[600px] flex flex-col items-center justify-center gap-12 ${visibilityClass}`}>

      {/* Mobile Header */}
      <div className="relative z-10 max-w-md text-center">
        <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 text-[8rem] font-bold text-foreground/5 select-none -z-10 font-heading italic leading-none whitespace-nowrap">
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

      {/* Premium 3D Stack - Liquid Glass Effect */}
      <div className="relative w-[85vw] max-w-sm h-[450px] perspective-1000 mt-4 mx-auto">
        {photos.length > 0 ? photos.map((photo, index) => {
          // Limit stack depth on mobile for performance/visuals
          if (index > 4) return null;

          return (
            <div
              key={photo.id}
              className="absolute top-0 left-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group"
              style={{
                transform: `translate3d(${index * 2}px, ${index * 8}px, -${index * 30}px) rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                zIndex: 50 - index,
                opacity: 1 - (index * 0.1)
              }}
              onClick={() => onOpenLightbox(index)}
            >
              {/* Card Container with Liquid Glass Effect */}
              <div className="w-full h-full rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-md border border-white/10 ring-1 ring-white/20">
                <div className="absolute inset-0 z-10 bg-gradient-to-tr from-white/20 to-transparent opacity-50 pointer-events-none" />
                <PhotoCard
                  src={photo.image_url}
                  title={photo.title ?? undefined}
                  category={photo.category ?? undefined}
                  aspectRatio="4/5"
                  onClick={() => onOpenLightbox(index)}
                />
              </div>
            </div>
          );
        }) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
            <p className="font-typewriter text-muted-foreground text-xs">No photos</p>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <span className="text-[10px] font-typewriter tracking-widest text-muted-foreground uppercase opacity-50">Swipe / Tap to View</span>
      </div>
    </div>
  );
};

interface GalleryProps {
  photos: Photo[];
}

const Gallery = ({ photos }: GalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentSectionPhotos, setCurrentSectionPhotos] = useState<Photo[]>([]);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mapping for fixing labels if they default to "concert"
  const getSectionLabel = (section: string | null | undefined, originalCategory: string | null | undefined) => {
    if (originalCategory && originalCategory.toLowerCase() !== 'concert') return originalCategory;

    switch (section) {
      case 'concerts': return 'Concert';
      case 'street': return 'Street';
      case 'edits': return 'Edit';
      case 'events': return 'Event';
      default: return 'Concert';
    }
  };

  // Group photos by section and apply labeling fix
  const sections = {
    concerts: photos
      .filter(p => p.section === 'concerts' || !p.section)
      .map(p => ({ ...p, category: getSectionLabel(p.section || 'concerts', p.category) })),
    street: photos
      .filter(p => p.section === 'street')
      .map(p => ({ ...p, category: getSectionLabel('street', p.category) })),
    edits: photos
      .filter(p => p.section === 'edits')
      .map(p => ({ ...p, category: getSectionLabel('edits', p.category) })),
    events: photos
      .filter(p => p.section === 'events')
      .map(p => ({ ...p, category: getSectionLabel('events', p.category) })),
  };

  // Helper to open lightbox with specific section photos
  const openLightbox = (sectionPhotos: Photo[], index: number) => {
    setCurrentSectionPhotos(sectionPhotos);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleAddPhoto = () => {
    navigate('/admin');
  };

  const hasPhotos = photos.length > 0;

  return (
    <section id="gallery" className="relative">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-background to-background pointer-events-none -z-10" />

      {hasPhotos || isAuthenticated ? (
        <div className="space-y-0 divide-y divide-border/20">

          {/* ================= CONCERTS ================= */}
          {(sections.concerts.length > 0 || isAuthenticated) && (
            <CollageSection
              number="01"
              title="Concerts"
              subtitle="SWIPE TO EXPLORE NOISE."
              photos={sections.concerts}
              onOpenLightbox={(index) => openLightbox(sections.concerts, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
            />
          )}
          {(sections.concerts.length > 0 || isAuthenticated) && (
            <StackSection
              number="01"
              title="Concerts"
              subtitle="SWIPE TO EXPLORE NOISE."
              photos={sections.concerts}
              onOpenLightbox={(index) => openLightbox(sections.concerts, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
              isMobileStack={true}
            />
          )}


          {/* ================= STREET ================= */}
          {(sections.street.length > 0 || isAuthenticated) && (
            <CollageSection
              number="02"
              title="Street"
              subtitle="UNSCRIPTED URBAN REALITY."
              photos={sections.street}
              onOpenLightbox={(index) => openLightbox(sections.street, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
            />
          )}
          {(sections.street.length > 0 || isAuthenticated) && (
            <StackSection
              number="02"
              title="Street"
              subtitle="UNSCRIPTED URBAN REALITY."
              photos={sections.street}
              onOpenLightbox={(index) => openLightbox(sections.street, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
              isMobileStack={true}
            />
          )}


          {/* ================= EDITS ================= */}
          {(sections.edits.length > 0 || isAuthenticated) && (
            <CollageSection
              number="03"
              title="Edits"
              subtitle="THE ART OF COLORS."
              photos={sections.edits}
              onOpenLightbox={(index) => openLightbox(sections.edits, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
            />
          )}
          {(sections.edits.length > 0 || isAuthenticated) && (
            <StackSection
              number="03"
              title="Edits"
              subtitle="THE ART OF COLORS."
              photos={sections.edits}
              onOpenLightbox={(index) => openLightbox(sections.edits, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
              isMobileStack={true}
            />
          )}

          {/* ================= EVENTS ================= */}
          {(sections.events.length > 0 || isAuthenticated) && (
            <CollageSection
              number="04"
              title="Events"
              subtitle="CAPTURED MOMENTS & MEMORIES."
              photos={sections.events}
              onOpenLightbox={(index) => openLightbox(sections.events, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
            />
          )}
          {(sections.events.length > 0 || isAuthenticated) && (
            <StackSection
              number="04"
              title="Events"
              subtitle="CAPTURED MOMENTS & MEMORIES."
              photos={sections.events}
              onOpenLightbox={(index) => openLightbox(sections.events, index)}
              isAdmin={isAuthenticated}
              onAddPhoto={handleAddPhoto}
              isMobileStack={true}
            />
          )}

        </div>
      ) : (
        <div className="container text-center py-40 text-muted-foreground">
          <p className="text-2xl font-light font-typewriter">No photos uploaded yet.</p>
          <p className="text-base mt-4 text-primary font-typewriter">Use the admin portal to publish your work.</p>
        </div>
      )}

      <Lightbox
        photos={currentSectionPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentPhotoIndex}
      />
    </section>
  );
};

export default Gallery;
