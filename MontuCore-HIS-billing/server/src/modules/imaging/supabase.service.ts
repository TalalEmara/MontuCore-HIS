import { createClient } from '@supabase/supabase-js';

// Initialize the Admin Client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Strategy 1: Public URL (Easiest)
 * If your bucket is "Public", you just need to construct the string.
 * Use this if the frontend uploads the file directly using the Anon Key.
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Strategy 2: Signed Upload URL (More Secure)
 * Use this if you want the Backend to authorize the upload first.
 * 1. Frontend calls API -> Backend generates this URL.
 * 2. Frontend uploads directly to this URL (bypassing Backend bandwidth).
 */
export const generateUploadUrl = async (bucket: string, fileName: string) => {
  // Create a signed URL valid for 60 seconds
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(fileName);

  if (error) {
    throw new Error(`Supabase Upload Error: ${error.message}`);
  }

  return {
    signedUrl: data.signedUrl,
    path: data.path, // Save this path to DB if needed
    token: data.token
  };
};

/**
 * Helper: Delete File
 * Useful when deleting a Case or Exam
 */
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error(`Failed to delete ${path}:`, error.message);
    return false;
  }
  return true;
};
