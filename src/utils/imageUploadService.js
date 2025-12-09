import apiClient from './apiClient';

/**
 * Image Upload Service
 * Handles all image upload-related API calls
 * 
 * Endpoints:
 * - POST /api/v1/admin/image-upload - Upload a single image
 * 
 * Expected response format:
 * {
 *   url: "https://..." // or imageUrl, secure_url (Cloudinary), etc.
 * }
 */

// Upload single image
export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/image-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload multiple images
export const uploadImages = async (imageFiles) => {
  try {
    const formData = new FormData();
    // Handle both File objects and objects with file property
    imageFiles.forEach((fileOrObj, index) => {
      const file = fileOrObj instanceof File ? fileOrObj : (fileOrObj?.file || fileOrObj);
      if (file instanceof File) {
        formData.append(`images`, file);
      } else {
        console.warn('Invalid file at index', index, ':', fileOrObj);
      }
    });

    const response = await apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete image
export const deleteImage = async (imageId) => {
  try {
    const response = await apiClient.delete(`/upload/images/${imageId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get image URL (if your API provides image URLs)
export const getImageUrl = (imagePath) => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
  // Remove /api from baseURL if image server is separate
  const imageBaseURL = baseURL.replace('/api', '');
  return imagePath?.startsWith('http') ? imagePath : `${imageBaseURL}${imagePath}`;
};

