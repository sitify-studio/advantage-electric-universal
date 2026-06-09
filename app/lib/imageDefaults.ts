/** Default Next/Image quality (1–100). 90 balances sharpness and file size. */
export const IMAGE_QUALITY = 90;

/** Hero / LCP backgrounds */
export const IMAGE_QUALITY_HIGH = 95;

export const IMAGE_SIZES = {
  fullWidth: '100vw',
  heroCell: '(max-width: 768px) 50vw, (max-width: 1200px) 45vw, 520px',
  sectionHalf: '(max-width: 1024px) 100vw, 50vw',
  sectionWide: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px',
  gridThird: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px',
  galleryTile: '(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 520px',
  portrait: '(max-width: 1024px) 100vw, (max-width: 1280px) 33vw, 480px',
  logo: '(max-width: 768px) 160px, 220px',
  thumb: '(max-width: 768px) 120px, 160px',
  content: '(max-width: 768px) 100vw, 800px',
} as const;
