// Real ImageKit implementation with proper logging

import ImageKit from 'imagekit';

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
});

// Upload logo function
export const uploadLogo = async (userId: string, file: File) => {
  try {
    console.log(`Uploading logo for user ${userId}...`);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Simple upload without folder parameter
    const result = await imagekit.upload({
      file: base64,
      fileName: `logo-${userId}-${Date.now()}.${file.name.split('.').pop()}`,
      useUniqueFileName: false,
    });
    
    console.log('Logo upload successful:', result.url);
    return { url: result.url, error: null };
  } catch (error) {
    console.error('Error uploading logo:', error);
    return { url: null, error: error as Error };
  }
};

// Upload signature function
export const uploadSignature = async (userId: string, signature: string) => {
  try {
    console.log(`Uploading signature for user ${userId}...`);
    
    // Ensure the signature is properly formatted
    let signatureData = signature;
    
    // If the signature includes a data URL prefix, extract the base64 part
    if (signature.startsWith('data:')) {
      console.log('Signature is a data URL, extracting base64 part');
      signatureData = signature.split(',')[1];
    }
    
    // Simple upload without folder parameter
    const result = await imagekit.upload({
      file: signatureData,
      fileName: `signature-${userId}-${Date.now()}.png`,
      useUniqueFileName: false,
    });
    
    console.log('Signature upload successful:', result.url);
    return { url: result.url, error: null };
  } catch (error) {
    console.error('Error uploading signature:', error);
    return { url: null, error: error as Error };
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Converting file to base64: ${file.name} (${file.size} bytes)`);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        console.log('File successfully converted to base64');
        resolve(base64);
      } else {
        console.error('Failed to convert file to base64: result is not a string');
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => {
      console.error('Error in FileReader:', error);
      reject(error);
    };
  });
}; 