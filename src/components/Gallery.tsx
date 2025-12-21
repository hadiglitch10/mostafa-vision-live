import { useState } from "react";
import PhotoCard from "./PhotoCard";
import Lightbox from "./Lightbox";

interface Photo {
  id: string;
  image_url: string;
  title?: string;
  category?: string;
}

interface GalleryProps {
  photos: Photo[];
}

const Gallery = ({ photos }: GalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="gallery" className="py-20 md:py-32 container">
      <div className="mb-12 md:mb-16">
        <h2 className="section-title">Selected Work</h2>
        <p className="text-2xl md:text-3xl font-semibold tracking-tight max-w-xl">
          Moments frozen in time. Energy captured forever.
        </p>
      </div>

      {photos.length > 0 ? (
        <div className="masonry-grid">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              src={photo.image_url}
              title={photo.title ?? undefined}
              category={photo.category ?? undefined}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No photos yet.</p>
          <p className="text-sm mt-2">Add photos through your backend to display them here.</p>
        </div>
      )}

      <Lightbox
        photos={photos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentPhotoIndex}
      />
    </section>
  );
};

export default Gallery;
