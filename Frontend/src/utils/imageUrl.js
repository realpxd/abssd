import api from '../api/config.js';

/**
 * Converts relative image URLs to absolute URLs pointing to the backend
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @returns {string} - The absolute URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  // If it's already a full URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads/, prepend backend base URL
  if (imageUrl.startsWith('/uploads/')) {
    // Remove /api from baseURL to get the backend root URL
    const backendBaseUrl = api.baseURL;
    return `${backendBaseUrl}${imageUrl}`;
  }

  // For any other relative path, return as-is (might be a local asset)
  return imageUrl;
};

export default getImageUrl;
