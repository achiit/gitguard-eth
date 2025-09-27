import ImageKit from 'imagekit';
import { log } from './vite';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_2hfnz7ddlwiZCqKCo59JVQhROfQ=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_77ZSDeXP3lHu1ibx3T2kizyl2eg=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/8ahutqfa6/',
});

// Upload signature function
export const uploadSignature = async (userId: string, signature: string) => {
  try {
    // Ensure the signature is properly formatted
    let signatureData = signature;
    
    // If the signature includes a data URL prefix, extract the base64 part
    if (signature.startsWith('data:')) {
      signatureData = signature.split(',')[1];
    }
    
    // Upload to ImageKit
    const result = await imagekit.upload({
      file: signatureData,
      fileName: `signature-${Date.now()}.png`,
      folder: `/signatures/${userId}`,
      useUniqueFileName: true,
    });
    
    return { url: result.url, error: null };
  } catch (error) {
    log(`Error uploading signature: ${(error as Error).message}`);
    return { url: null, error: error as Error };
  }
};

// List files in a folder
export const listFiles = async (path: string) => {
  try {
    const files = await imagekit.listFiles({
      path
    });
    return { files, error: null };
  } catch (error) {
    log(`Error listing files: ${(error as Error).message}`);
    return { files: null, error: error as Error };
  }
};

// Delete a file
export const deleteFile = async (fileId: string) => {
  try {
    await imagekit.deleteFile(fileId);
    return { success: true, error: null };
  } catch (error) {
    log(`Error deleting file: ${(error as Error).message}`);
    return { success: false, error: error as Error };
  }
};

export { imagekit }; 