# Image URL Usage Guide

## How to Use Images in Templates

All uploaded images are served from the backend at:
```
http://localhost:5000/api/uploads/[filename]
```

## Using the `getImageSrc` Helper

Import and use the `getImageSrc` helper function from `@/lib/utils`:

```jsx
import { getImageSrc } from '@/lib/utils'

// Example with featured image
<img 
  src={getImageSrc(project.featuredImage.url)} 
  alt={project.title}
  className="w-16 h-16 object-cover"
/>a
// Example with thumbnail
<img 
  src={getImageSrc(service.thumbnailImage.url)} 
  alt={service.name}
/>

// Example with hero media items
{heroMediaItems.map((item, index) => (
  <img 
    key={index}
    src={getImageSrc(item.url)} 
    alt={item.altText}
  />
))}
```

## Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://your-production-domain.com
```

## How It Works

The `getImageSrc` function:
1. Takes a file path (can be just filename or full path)
2. Extracts the filename from any path
3. Constructs the full URL using the pattern: `{VITE_API_URL}/api/uploads/{filename}`
4. Returns the complete URL ready for use in `<img>` tags

## Examples

### Input → Output

- `"image.jpg"` → `"http://localhost:5000/api/uploads/image.jpg"`
- `"/uploads/image.jpg"` → `"http://localhost:5000/api/uploads/image.jpg"`
- `"https://example.com/image.jpg"` → `"https://example.com/image.jpg"` (unchanged)

### Common Use Cases

#### Project Featured Image
```jsx
<img 
  src={getImageSrc(project.featuredImage?.url)} 
  alt={project.title}
/>
```

#### Blog Post Featured Image
```jsx
<img 
  src={getImageSrc(post.featuredImage?.url)} 
  alt={post.title}
/>
```

#### Service Thumbnail
```jsx
<img 
  src={getImageSrc(service.thumbnailImage?.url)} 
  alt={service.name}
/>
```

#### Hero Media Items
```jsx
{heroMediaItems?.map((item, index) => (
  <img 
    key={index}
    src={getImageSrc(item.url)} 
    alt={item.altText || 'Hero image'}
  />
))}
```

#### CTA Image
```jsx
<img 
  src={getImageSrc(cta.image?.url)} 
  alt="Call to action image"
/>
```

## Important Notes

- Images are served publicly without authentication
- The backend CORS headers allow cross-origin access
- No caching headers are set (images are always fresh)
- Use `getImageSrc` for consistency across the application
- The function handles both relative paths and full URLs gracefully
