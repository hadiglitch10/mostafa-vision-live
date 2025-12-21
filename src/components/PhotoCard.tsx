interface PhotoCardProps {
  src: string;
  title?: string;
  category?: string;
  onClick: () => void;
}

const PhotoCard = ({ src, title, category, onClick }: PhotoCardProps) => {
  return (
    <div className="photo-card masonry-item" onClick={onClick}>
      <img
        src={src}
        alt={title || "Photography by Mostafavision"}
        loading="lazy"
        className="rounded-sm"
      />
      <div className="photo-overlay flex flex-col justify-end p-4">
        {category && (
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-1">
            {category}
          </span>
        )}
        {title && (
          <span className="text-sm font-medium text-foreground">
            {title}
          </span>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
