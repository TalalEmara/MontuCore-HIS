import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CdssService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }

  async getDicomImageUrl(bucketName: string, filePath: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async getDicomImageSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async listDicomImages(bucketName: string, folderPath: string = ''): Promise<any[]> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  }
}