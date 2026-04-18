import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/db.js';
import { products, artists } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { ROOT_MEDIA_DIR, generateArtistTreeName } from '../services/mediaService.js';

export const musicRouter = Router();

musicRouter.get('/:handle/tracks', async (req, res) => {
  const { handle } = req.params;
  try {
    const productList = await db.select({
      id: products.id,
      title: products.title,
      artistHumanId: artists.humanId,
      stageName: artists.stageName
    })
    .from(products)
    .innerJoin(artists, eq(products.artistId, artists.humanId))
    .where(eq(products.handle, handle))
    .limit(1);

    if (!productList.length) {
       res.status(404).json({ error: 'Product not found' });
       return;
    }
    const product = productList[0];
    
    // Determine the direct filesystem repository tree mapping
    const artistDir = generateArtistTreeName(product.artistHumanId, product.stageName || '');
    const mastersDir = path.join(ROOT_MEDIA_DIR, artistDir, 'products', 'music', 'masters');
    
    let contents = [];
    try {
      contents = await fs.readdir(mastersDir, { withFileTypes: true });
    } catch (e) {
      // If the path isn't established or holds no files, fallback to empty array securely
       res.json({ tracks: [] });
       return;
    }

    // Match the target product folder to the DB product. We normalize strings dropping extensions.
    const productCleanToken = product.title.replace(/[\W_]+/g, "").toLowerCase().replace('vinyl', '').replace('cassette', '');
    const targetFolder = contents.find(dirent => {
      const folderCleanToken = dirent.name.replace(/[\W_]+/g, "").toLowerCase();
      return dirent.isDirectory() && (folderCleanToken.includes(productCleanToken) || productCleanToken.includes(folderCleanToken));
    });

    if (!targetFolder) {
       res.json({ tracks: [] });
       return;
    }

    const albumDir = path.join(mastersDir, targetFolder.name);
    const files = await fs.readdir(albumDir);

    // Grab all MP3s
    const mp3s = files.filter(f => f.endsWith('.mp3'));
    
    const tracksArr = mp3s.map((filename, idx) => ({
      id: idx + 1,
      title: filename.replace('.mp3', ''),
      url: `/media_assets/artists/${artistDir}/products/music/masters/${targetFolder.name}/${encodeURIComponent(filename)}`
    }));

     res.json({ tracks: tracksArr });
     return;
  } catch (error) {
    console.error('Track discovery failed:', error);
     res.status(500).json({ error: 'Server mapping internal structures failed' });
     return;
  }
});
