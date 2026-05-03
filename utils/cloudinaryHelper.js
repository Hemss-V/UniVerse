// utils/cloudinaryHelper.js
import { Platform } from 'react-native';

// 1. Paste your keys here (Make sure these are correct!)
const CLOUD_NAME = "dryspcqy6"; 
const UPLOAD_PRESET = "college_upload"; 

export const uploadToCloudinary = async (imageUri) => {
  if (!imageUri) return null;

  const data = new FormData();

  // 2. Add the file (Handle Web vs Mobile differences)
  if (Platform.OS === 'web') {
    // --- WEB FIX ---
    // On web, we must fetch the blob first
    const response = await fetch(imageUri);
    const blob = await response.blob();
    data.append('file', blob);
  } else {
    // --- MOBILE FIX ---
    // On Android/iOS, we send the uri object
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
  }

  data.append('upload_preset', UPLOAD_PRESET);
  data.append('cloud_name', CLOUD_NAME);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
      // Note: Do NOT set 'Content-Type' header manually for FormData, fetch does it automatically
    });

    const json = await res.json();

    if (json.secure_url) {
      return json.secure_url;
    } else {
      // Log the REAL error message from Cloudinary
      console.error("Cloudinary Error Details:", json); 
      throw new Error(json.error?.message || "Image upload failed");
    }
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};