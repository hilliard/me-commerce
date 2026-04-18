import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root repository path relative to the src/services file
export const ROOT_MEDIA_DIR = path.resolve(__dirname, '../../public/media_assets/artists');

export const generateArtistTreeName = (artistId: number, stageName: string) => {
  const sanitizedName = stageName.replace(/[^a-zA-Z0-9]/g, '').trim();
  return `${artistId}-${sanitizedName}`;
};

export const provisionArtistDirectories = async (artistId: number, stageName: string) => {
  const artistDirName = generateArtistTreeName(artistId, stageName);
  const artistRoot = path.join(ROOT_MEDIA_DIR, artistDirName);

  const directoriesToCreate = [
    artistRoot,
    path.join(artistRoot, 'products', 'music', 'masters'),
    path.join(artistRoot, 'products', 'music', 'previews'),
    path.join(artistRoot, 'products', 'photos', 'high_res'),
    path.join(artistRoot, 'products', 'photos', 'low_res'),
    path.join(artistRoot, 'products', 'photos', 'watermark'),
    path.join(artistRoot, 'products', 'videos', 'source'),
    path.join(artistRoot, 'products', 'videos', 'thumbnails'),
    path.join(artistRoot, 'profile')
  ];

  try {
    for (const dir of directoriesToCreate) {
      await fs.mkdir(dir, { recursive: true });
    }
    console.log(`Successfully provisioned media structure for artist: ${artistDirName}`);
    return artistRoot;
  } catch (error) {
    console.error(`Failed to provision media directories for ${stageName}:`, error);
    throw error;
  }
};
