import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/db.js';
import { products, artists, songs, productSongs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { ROOT_MEDIA_DIR, generateArtistTreeName } from '../services/mediaService.js';

export const musicRouter = Router();

musicRouter.get('/:handle/tracks', async (req, res) => {
  const { handle } = req.params;
  try {
    const productList = await db.select({
      id: products.id,
      title: products.title
    })
    .from(products)
    .where(eq(products.handle, handle))
    .limit(1);

    if (!productList.length) {
       res.status(404).json({ error: 'Product not found' });
       return;
    }
    const product = productList[0];
    
    // Natively extract from the true relational DB schema
    const rawTracks = await db.select({
      id: songs.id,
      title: songs.title,
      url: songs.pathUrl,
      price: songs.price
    })
    .from(productSongs)
    .innerJoin(songs, eq(productSongs.songId, songs.id))
    .where(eq(productSongs.productId, product.id))
    .orderBy(productSongs.trackOrder);

    // Filter out any songs that don't have a valid url path (un-uploaded streams)
    const validTracks = rawTracks.filter(t => t.url && t.url !== 'no-path');

    res.json({ tracks: validTracks });
    return;
  } catch (error) {
    console.error('Track discovery failed:', error);
    res.status(500).json({ error: 'Server mapping internal structures failed' });
    return;
  }
});
