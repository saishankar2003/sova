import { supabase } from '../lib/supabase';
import { ApiError } from '../utils/apiError';

export async function uploadEhcpDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ path: string; publicUrl: string }> {
  if (!supabase) {
    throw ApiError.internal('Supabase client is not configured');
  }

  const timestamp = Date.now();
  const filePath = `ehcp-docs/${timestamp}-${fileName}`;

  const { data, error } = await supabase.storage
    .from('saishankar')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw ApiError.internal(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('saishankar')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}
