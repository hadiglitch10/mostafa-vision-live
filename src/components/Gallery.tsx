import { useState, useRef, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import Lightbox from "./Lightbox";
import { Photo } from "@/hooks/usePhotos";

interface SectionProps {
  number: string;
  title: string;
  photos: Photo[];
  allPhotos: Photo[];
  startIndex: number;
  onOpenLightbox: (index: number) => void;
}

const GallerySection = ({ number, title, photos, onOpenLightbox, startIndex }: SectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (photos.length === 0) return null;

  return (
    <div 
      ref={sectionRef}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      {/* Section Header */}
      <div className="flex items-end gap-6 mb-8 md:mb-12">
        <span className="text-8xl md:text-[10rem] font-black text-primary/20 leading-none tracking-tighter">
          {number}
        </span>
        <div className="pb-2 md:pb-4">
          <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </p>
        </div>
      </div>

      {/* Staggered Masonry Grid */}
      <div className="staggered-grid">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="staggered-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PhotoCard
              src={photo.image_url}
              title={photo.title ?? undefined}
              category={photo.category ?? undefined}
              onClick={() => onOpenLightbox(startIndex + index)}
            />
          </div>
        ))}
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

  // Group photos by section
  const sections = {
    concerts: photos.filter(p => p.section === 'concerts' || !p.section),
    street: photos.filter(p => p.section === 'street'),
    edits: photos.filter(p => p.section === 'edits'),
  };

  // Create flat array for lightbox navigation
  const allPhotos = [...sections.concerts, ...sections.street, ...sections.edits];

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  // Calculate start indices for each section
  const concertsStart = 0;
  const streetStart = sections.concerts.length;
  const editsStart = streetStart + sections.street.length;

  const hasPhotos = allPhotos.length > 0;

  return (
    <section id="gallery" className="py-20 md:py-32">
      {/* Section Intro */}
      <div className="container mb-16 md:mb-24">
        <p className="section-title">Selected Work</p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl">
          Moments frozen in time. Energy captured forever.
        </h2>
      </div>

      {hasPhotos ? (
        <div className="space-y-24 md:space-y-40">
          {/* Concerts Section - Full bleed */}
          {sections.concerts.length > 0 && (
            <div className="full-bleed-section">
              <div className="container">
                <GallerySection
                  number="01"
                  title="Concerts"
                  photos={sections.concerts}
                  allPhotos={allPhotos}
                  startIndex={concertsStart}
                  onOpenLightbox={openLightbox}
                />
              </div>
            </div>
          )}

          {/* Street Section - With whitespace */}
          {sections.street.length > 0 && (
            <div className="container">
              <GallerySection
                number="02"
                title="Street"
                photos={sections.street}
                allPhotos={allPhotos}
                startIndex={streetStart}
                onOpenLightbox={openLightbox}
              />
            </div>
          )}

          {/* Edits Section - Full bleed */}
          {sections.edits.length > 0 && (
            <div className="full-bleed-section">
              <div className="container">
                <GallerySection
                  number="03"
                  title="Edits"
                  photos={sections.edits}
                  allPhotos={allPhotos}
                  startIndex={editsStart}
                  onOpenLightbox={openLightbox}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="container text-center py-20 text-muted-foreground">
          <p className="text-lg">No photos yet.</p>
          <p className="text-sm mt-2">Add photos through the admin dashboard to display them here.</p>
        </div>
      )}

      <Lightbox
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentPhotoIndex}
      />
    </section>
  );
};

export default Gallery;
