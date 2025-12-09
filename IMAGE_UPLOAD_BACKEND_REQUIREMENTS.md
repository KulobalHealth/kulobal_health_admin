# Image Upload Backend Requirements

## Overview
The frontend Add Product page is currently unable to upload images because the required backend endpoints are not implemented yet. This document outlines what needs to be implemented on the backend.

## Current Status
- ✅ Frontend UI for image upload is complete
- ✅ Frontend handles multiple image files (up to 5)
- ✅ Frontend gracefully handles missing endpoints (creates products without images)
- ❌ Backend endpoints are not implemented (returning 404)

## Required Backend Endpoints

### 1. Upload Single Image
**Endpoint:** `POST /api/v1/admin/upload/image`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with field name `image` containing the image file

**Expected Response:**
```json
{
  "url": "https://your-cdn.com/path/to/image.jpg",
  "imageId": "optional-image-id-for-deletion"
}
```

**Alternative Response Formats (also supported by frontend):**
```json
{
  "imageUrl": "https://...",
  "data": {
    "url": "https://..."
  }
}
```

Or Cloudinary format:
```json
{
  "secure_url": "https://...",
  "public_id": "..."
}
```

**Status Codes:**
- `200` or `201` - Success
- `400` - Invalid file format or size
- `401` - Unauthorized
- `413` - File too large

### 2. Upload Multiple Images
**Endpoint:** `POST /api/v1/admin/upload/images`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with field name `images` containing multiple image files

**Expected Response:**
```json
{
  "urls": [
    "https://your-cdn.com/path/to/image1.jpg",
    "https://your-cdn.com/path/to/image2.jpg"
  ]
}
```

**Alternative Response Format:**
```json
{
  "data": [
    { "url": "https://...", "imageId": "..." },
    { "url": "https://...", "imageId": "..." }
  ]
}
```

### 3. Delete Image (Optional for now)
**Endpoint:** `DELETE /api/v1/admin/upload/images/:id`

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

## Implementation Recommendations

### File Storage Options

1. **Cloud Storage (Recommended)**
   - Cloudinary (easy to integrate, has free tier)
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage

2. **Local Storage (Not recommended for production)**
   - Store in `uploads/` directory
   - Serve via Express static middleware

### Sample Implementation (Node.js/Express with Cloudinary)

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kulobal-health/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Single image upload
router.post('/upload/image', 
  authMiddleware, 
  upload.single('image'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      res.status(200).json({
        url: req.file.path, // Cloudinary URL
        imageId: req.file.filename, // For deletion
        secure_url: req.file.path
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
);

// Multiple images upload
router.post('/upload/images', 
  authMiddleware, 
  upload.array('images', 5), // Max 5 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }
      
      const urls = req.files.map(file => file.path);
      
      res.status(200).json({
        urls: urls,
        data: req.files.map(file => ({
          url: file.path,
          imageId: file.filename
        }))
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: 'Failed to upload images' });
    }
  }
);

// Delete image
router.delete('/upload/images/:id', 
  authMiddleware, 
  async (req, res) => {
    try {
      const { id } = req.params;
      await cloudinary.uploader.destroy(id);
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: 'Failed to delete image' });
    }
  }
);
```

### Environment Variables Needed

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

### Using Postman

1. **Single Image Upload**
   ```
   POST http://localhost:3000/api/v1/admin/upload/image
   Authorization: Bearer <your-token>
   Body: form-data
   - Key: image
   - Type: File
   - Value: [Select image file]
   ```

2. **Multiple Images Upload**
   ```
   POST http://localhost:3000/api/v1/admin/upload/images
   Authorization: Bearer <your-token>
   Body: form-data
   - Key: images (multiple)
   - Type: File
   - Value: [Select multiple image files]
   ```

### Using cURL

```bash
# Single image
curl -X POST http://localhost:3000/api/v1/admin/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"

# Multiple images
curl -X POST http://localhost:3000/api/v1/admin/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Validation Requirements

1. **File Type**: Only accept image files (jpg, jpeg, png, webp)
2. **File Size**: Limit to 5MB per image
3. **Number of Files**: Max 5 images for multiple upload
4. **Authentication**: Require valid admin token
5. **Error Handling**: Return appropriate error messages

## Frontend Integration

Once the endpoints are implemented:

1. The frontend will automatically start uploading images
2. Products will be created with `photos` array containing image URLs
3. No frontend changes needed - it already handles the endpoint

## Current Workaround

Until the endpoints are implemented:
- ✅ Products can still be created without images
- ✅ A warning message is shown to users
- ✅ Console logs indicate the missing endpoint
- ⚠️ Users will see: "Image upload is not available yet. Product will be created without images."

## Priority
**MEDIUM** - The system works without images, but adding images is important for the user experience and product display.

## Questions?
Contact the frontend developer for any clarifications about the expected request/response formats.
