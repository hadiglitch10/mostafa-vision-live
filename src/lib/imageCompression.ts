// Client-side image compression utility
// Resizes to max 2000px and converts to WebP at 80% quality

export interface CompressedImage {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

export const compressImage = async (
  file: File,
  maxWidth: number = 2000,
  quality: number = 0.8
): Promise<CompressedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }

          // Generate new filename with .webp extension
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const filename = `${originalName}-${Date.now()}.webp`;

          resolve({
            blob,
            filename,
            width,
            height,
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};
