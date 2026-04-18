import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { db } from '../db/db.js';
import { artists, humans, products, songs, productSongs, artistMembers, artistManagers } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { provisionArtistDirectories, ROOT_MEDIA_DIR, generateArtistTreeName } from '../services/mediaService.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// Multer Disk Configuration mapping directly to the media schema
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { artistDirName, target, albumName } = req.body;
    let targetPath = '';
    
    if (target === 'profile') {
      targetPath = path.join(ROOT_MEDIA_DIR, artistDirName, 'profile');
    } else if (target === 'masters') {
      targetPath = path.join(ROOT_MEDIA_DIR, artistDirName, 'products', 'music', 'masters', albumName || 'Singles');
    } else if (target === 'photos') {
      targetPath = path.join(ROOT_MEDIA_DIR, artistDirName, 'products', 'photos');
    } else {
      return cb(new Error('Invalid destination target'), '');
    }

    fs.mkdirSync(targetPath, { recursive: true });
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    // Replace spaces, preserve extension
    const sanitized = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, sanitized);
  }
});
const upload = multer({ storage });
const memUpload = multer({ storage: multer.memoryStorage() });

adminRouter.post('/upload', upload.array('mediaFiles', 50), (req, res) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
     res.status(400).json({ error: 'No file uploaded' });
     return;
  }
  
  // Format the url path mapping to the statically hosted public folder
  const urls = (req.files as Express.Multer.File[]).map(file => {
    const normalPath = file.path.replace(/\\/g, '/');
    return '/media_assets' + normalPath.split('media_assets')[1];
  });
  
  res.json({ message: 'Upload complete', urls });
});

adminRouter.get('/users', async (req, res) => {
  try {
    // We safely use raw SQL map to bypass Drizzle duplication when joining bridging tables seamlessly
    const rawUsers: any = await db.execute(sql`
      SELECT 
        h.id, 
        h.first_name AS "firstName", 
        h.last_name AS "lastName", 
        h.email, 
        h.is_active AS "isActive",
        MAX(a1.stage_name) AS "managerStageName",
        MAX(a2.stage_name) AS "memberStageName"
      FROM humans h
      LEFT JOIN artist_managers am ON h.id = am.human_id
      LEFT JOIN artists a1 ON am.artist_id = a1.id
      LEFT JOIN artist_members amemb ON h.id = amemb.human_id
      LEFT JOIN artists a2 ON amemb.artist_id = a2.id
      GROUP BY h.id
    `);

    // Safely extract rows whether nested by Postgres pg driver or raw array
    const actualRows = rawUsers.rows ? rawUsers.rows : rawUsers;

    const users = actualRows.map((u: any) => {
      // Prioritize the stage name they "Manage" natively or the Band they are a part of
      const stageName = u.managerStageName || u.memberStageName || null;
      let roles = 'User';
      if (u.managerStageName && !u.memberStageName) roles = 'Artist Manager';
      else if (!u.managerStageName && u.memberStageName) roles = 'Band Member';
      else if (u.managerStageName && u.memberStageName) roles = 'Manager / Band Member';
      
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        isActive: u.isActive,
        stageName,
        rolesComputed: roles
      };
    });

    res.json(users);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/artists', async (req, res) => {
  const { humanId, stageName, bio } = req.body;
  
  if (!humanId || !stageName) {
     res.status(400).json({ error: 'humanId and stageName required' });
     return;
  }

  try {
    // Defensively ensure the core human record exists to satisfy Postgres FK constraint
    await db.insert(humans).values({
      id: Number(humanId),
      firstName: stageName,
      lastName: 'Provisioned',
      email: `sandbox_${humanId}@sandbox.local`
    }).onConflictDoNothing();

    const [newArtist] = await db.insert(artists).values({
      humanId: Number(humanId),
      stageName,
      bio
    })
    .onConflictDoUpdate({
      target: artists.humanId,
      set: { stageName, bio }
    })
    .returning();

    // Dynamically provision the explicit filesystem tree after successful DB commit
    await provisionArtistDirectories(newArtist.humanId, newArtist.stageName);

     res.status(201).json({ 
      message: 'Artist created and specific media architecture actively provisioned', 
      artist: newArtist 
    });
    return;
  } catch (error: any) {
    console.error('Failed to create artist:', error);
     res.status(500).json({ error: 'Failed to fully provision artist profile', details: error.message || error.toString() });
     return;
  }
});

adminRouter.post('/artists/full', async (req, res) => {
  const { firstName, lastName, email, stageName, bio, website, debutYear, isGroup, members } = req.body;
  if (!firstName || !lastName || !email || !stageName) {
    res.status(400).json({ error: 'Missing core identity parameters' });
    return;
  }

  try {
    const [newHuman] = await db.insert(humans).values({
      firstName,
      lastName,
      email: email.toLowerCase()
    }).returning();

    const [newArtist] = await db.insert(artists).values({
      stageName,
      bio,
      website,
      debutYear: debutYear ? Number(debutYear) : null,
      isGroup: isGroup || false
    }).returning();

    // Dynamically build the Temporal Governance Bridge
    await db.insert(artistManagers).values({
      artistId: newArtist.id,
      humanId: newHuman.id
    });

    // Map out auxiliary group members recursively and map safely to artistMembers relation
    if (isGroup && Array.isArray(members)) {
      for (const m of members) {
        if (!m.firstName || !m.lastName || !m.email) continue;
        
        // Spawn internal human directly
        const [auxHuman] = await db.insert(humans).values({
           firstName: m.firstName,
           lastName: m.lastName,
           email: m.email.toLowerCase()
        }).returning();

        await db.insert(artistMembers).values({
           artistId: newArtist.id,
           humanId: auxHuman.id,
           role: m.role || 'Member'
        });
      }
    }

    // Dynamically provision the explicit filesystem tree after successful DB commit
    await provisionArtistDirectories(newArtist.id, newArtist.stageName);

    res.status(201).json({ message: 'Holistic Artist Profile generated safely.', artist: newArtist, human: newHuman });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to build artist identity', details: err.message });
  }
});

adminRouter.post('/products', memUpload.array('mediaFiles'), async (req, res) => {
  try {
    const { 
      productType, title, artistId, price, imagePath, year, genre, stockQuantity, trackDetails, description 
    } = req.body;

    if (!title || !artistId || !price) {
      res.status(400).json({ error: 'Missing core product fields' });
      return;
    }

    // Lookup artist to build directories natively
    const artistRecord = await db.select().from(artists).where(eq(artists.id, Number(artistId))).limit(1);
    const stageName = artistRecord.length > 0 ? artistRecord[0].stageName : 'Unknown';
    const artistTree = generateArtistTreeName(Number(artistId), stageName);

    // 1. Insert Core Product
    const handleTag = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const [newProduct] = await db.insert(products).values({
      title,
      handle: handleTag,
      productType,
      artistId: Number(artistId),
      price: price.toString(),
      image: imagePath,
      year: Number(year),
      genre,
      stock: Number(stockQuantity),
      description
    }).returning();

    // 2. Process Files against new Schema logic
    const files = req.files as Express.Multer.File[];
    let parsedTracks: any[] = [];
    try {
      parsedTracks = JSON.parse(trackDetails || '[]');
    } catch(e) {}

    const mastersDir = path.join(ROOT_MEDIA_DIR, artistTree, 'products', 'music', 'masters', title);
    
    if (parsedTracks.length > 0) {
      // Formally ensure strictly nested specific album directory locally inside Express
      await fsPromises.mkdir(mastersDir, { recursive: true });

      let fileCursor = 0;
      for (let i = 0; i < parsedTracks.length; i++) {
        const trackDef = parsedTracks[i];
        let urlPath = '';

        if (trackDef.hasFile && files[fileCursor]) {
          const file = files[fileCursor];
          const filename = `${trackDef.trackNumber}-${file.originalname.replace(/\\s+/g, '-').toLowerCase()}`;
          const finalPath = path.join(mastersDir, filename);
          
          // Write buffer from explicitly mapped memory stream directly
          await fsPromises.writeFile(finalPath, file.buffer);
          urlPath = `/media_assets/artists/${artistTree}/products/music/masters/${title}/${filename}`;
          fileCursor++;
        }

        // Bridge to database songs with detailed schema
        const [newSong] = await db.insert(songs).values({
          title: trackDef.title || `Track ${trackDef.trackNumber}`,
          artistId: Number(artistId),
          pathUrl: urlPath || 'no-path',
          isrc: trackDef.isrc || null,
          bpm: trackDef.bpm ? Number(trackDef.bpm) : null,
          durationSeconds: trackDef.duration ? Number(trackDef.duration) : null,
          isExplicit: trackDef.isExplicit || false,
          fileFormat: trackDef.fileFormat || 'MP3',
          price: trackDef.price ? trackDef.price.toString() : '0.99',
          genre: trackDef.genre || null,
          featuredArtist: trackDef.featuredArtist || null,
        }).returning();

        await db.insert(productSongs).values({
          productId: newProduct.id,
          songId: newSong.id,
          trackOrder: Number(trackDef.trackNumber) || i + 1
        });
      }
    }

    res.json({ message: 'Product effectively migrated with fully synced metadata schemas', product: newProduct });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed DB mapping transaction', details: err.message });
  }
});

adminRouter.get('/artists/stats', async (req, res) => {
  try {
    const stats = await db.select({
      id: artists.id,
      stageName: artists.stageName,
      isGroup: artists.isGroup,
      productCount: sql<number>`count(${products.id})`.mapWith(Number)
    })
    .from(artists)
    .leftJoin(products, eq(artists.id, products.artistId))
    .groupBy(artists.id, artists.stageName, artists.isGroup);
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get('/products/stats', async (req, res) => {
  try {
    const pStats = await db.select({
      id: products.id,
      title: products.title,
      price: products.price,
      stock: products.stock,
      productType: products.productType,
      artistName: artists.stageName
    })
    .from(products)
    .leftJoin(artists, eq(products.artistId, artists.id));
    
    res.json(pStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get('/artists/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const members = await db.select({
      id: humans.id,
      firstName: humans.firstName,
      lastName: humans.lastName,
      email: humans.email,
      role: artistMembers.role
    })
    .from(artistMembers)
    .innerJoin(humans, eq(artistMembers.humanId, humans.id))
    .where(eq(artistMembers.artistId, Number(id)));

    res.json(members);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get('/artists/:id/core', async (req, res) => {
  try {
    const { id } = req.params;
    const [artistRecord] = await db.select()
      .from(artists)
      .where(eq(artists.id, Number(id)))
      .limit(1);

    if (!artistRecord) {
      res.status(404).json({ error: 'Artist not physically found in registry' });
      return;
    }
    res.json(artistRecord);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/artists/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body; // Array of member objects
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      res.status(400).json({ error: 'Missing core identity mappings' });
      return;
    }

    // neon-http lacks transactional support natively. We execute explicitly sequentially to maintain DB consistency without breaking driver.
    for (const m of members) {
      if (!m.firstName || !m.lastName || !m.email) continue;
      
      // 1. Spawn absolute independent human structurally
      const [auxHuman] = await db.insert(humans).values({
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email.toLowerCase()
      }).returning();

      // 2. Map explicit structural bridge formally
      await db.insert(artistMembers).values({
        artistId: Number(id),
        humanId: auxHuman.id,
        role: m.role || 'Member'
      });
    }

    res.status(201).json({ message: 'Band Members structurally appended to brand securely.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post('/artists/merge', async (req, res) => {
  try {
    const { primaryId, mergeId } = req.body;
    if (!primaryId || !mergeId || primaryId === mergeId) {
       res.status(400).json({ error: 'Invalid merge targets mapped' });
       return;
    }

    // Transfer products formally
    await db.update(products)
      .set({ artistId: Number(primaryId) })
      .where(eq(products.artistId, Number(mergeId)));
      
    // Transfer associated independent songs formally
    await db.update(songs)
      .set({ artistId: Number(primaryId) })
      .where(eq(songs.artistId, Number(mergeId)));
      
    // Delete the obsolete alias identity natively
    await db.delete(artists)
      .where(eq(artists.id, Number(mergeId)));

    res.json({ message: 'Artist profiles effectively merged and de-duped natively' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/products/:id/full', async (req, res) => {
  try {
    const { id } = req.params;
    const [productRecord] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);

    if (!productRecord) {
      res.status(404).json({ error: 'Core Product not mapped in backend schema' });
      return;
    }

    // Pull physical tracks bridged
    const rawTracks = await db.select({
      songId: songs.id,
      trackOrder: productSongs.trackOrder,
      title: songs.title,
      durationSeconds: songs.durationSeconds,
      bpm: songs.bpm,
      isrc: songs.isrc,
      fileFormat: songs.fileFormat,
      price: songs.price,
      genre: songs.genre,
      featuredArtist: songs.featuredArtist,
      isExplicit: songs.isExplicit,
      pathUrl: songs.pathUrl
    })
    .from(productSongs)
    .innerJoin(songs, eq(productSongs.songId, songs.id))
    .where(eq(productSongs.productId, Number(id)))
    .orderBy(productSongs.trackOrder);

    res.json({ ...productRecord, tracks: rawTracks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.patch('/products/:id', memUpload.array('mediaFiles'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      productType, title, artistId, price, imagePath, year, genre, stockQuantity, trackDetails, deleteTrackIds, description 
    } = req.body;

    const productId = Number(id);

    // Partial Update Base Values
    await db.update(products).set({
      title,
      productType,
      artistId: Number(artistId),
      price: price.toString(),
      image: imagePath,
      year: Number(year),
      genre,
      stock: Number(stockQuantity),
      description
    }).where(eq(products.id, productId));

    // Handle Removed Dependencies Natively (Cascade implicitly handles DB mappings, explicitly unlinking)
    const targetDrops: number[] = JSON.parse(deleteTrackIds || '[]');
    for (const did of targetDrops) {
      await db.delete(songs).where(eq(songs.id, did));
    }

    const artistRecord = await db.select().from(artists).where(eq(artists.id, Number(artistId))).limit(1);
    const stageName = artistRecord.length > 0 ? artistRecord[0].stageName : 'Unknown';
    const artistTree = generateArtistTreeName(Number(artistId), stageName);
    const mastersDir = path.join(ROOT_MEDIA_DIR, artistTree, 'products', 'music', 'masters', title);

    const files = req.files as Express.Multer.File[];
    let parsedTracks: any[] = [];
    try {
      parsedTracks = JSON.parse(trackDetails || '[]');
    } catch(e) {}

    if (parsedTracks.length > 0) {
      await fsPromises.mkdir(mastersDir, { recursive: true });

      let fileCursor = 0;
      for (let i = 0; i < parsedTracks.length; i++) {
        const trackDef = parsedTracks[i];
        let urlPath = trackDef.existingPathUrl || '';

        if (trackDef.hasFile && files[fileCursor]) {
          const file = files[fileCursor];
          const filename = `${trackDef.trackNumber}-${file.originalname.replace(/\\s+/g, '-').toLowerCase()}`;
          const finalPath = path.join(mastersDir, filename);
          await fsPromises.writeFile(finalPath, file.buffer);
          urlPath = `/media_assets/artists/${artistTree}/products/music/masters/${title}/${filename}`;
          fileCursor++;
        }

        if (trackDef.songId) {
          // Explicit Update of existing isolated parameter
          await db.update(songs).set({
            title: trackDef.title || `Track ${trackDef.trackNumber}`,
            pathUrl: urlPath || 'no-path',
            isrc: trackDef.isrc || null,
            bpm: trackDef.bpm ? Number(trackDef.bpm) : null,
            durationSeconds: trackDef.duration ? Number(trackDef.duration) : null,
            isExplicit: trackDef.isExplicit || false,
            fileFormat: trackDef.fileFormat || 'MP3',
            price: trackDef.price ? trackDef.price.toString() : '0.99',
            genre: trackDef.genre || null,
            featuredArtist: trackDef.featuredArtist || null,
          }).where(eq(songs.id, trackDef.songId));
          
          await db.update(productSongs).set({
            trackOrder: Number(trackDef.trackNumber) || i + 1
          }).where(sql`${productSongs.productId} = ${productId} AND ${productSongs.songId} = ${trackDef.songId}`);

        } else {
          // Dynamic explicit insertion mapped cleanly
          const [newSong] = await db.insert(songs).values({
            title: trackDef.title || `Track ${trackDef.trackNumber}`,
            artistId: Number(artistId),
            pathUrl: urlPath || 'no-path',
            isrc: trackDef.isrc || null,
            bpm: trackDef.bpm ? Number(trackDef.bpm) : null,
            durationSeconds: trackDef.duration ? Number(trackDef.duration) : null,
            isExplicit: trackDef.isExplicit || false,
            fileFormat: trackDef.fileFormat || 'MP3',
            price: trackDef.price ? trackDef.price.toString() : '0.99',
            genre: trackDef.genre || null,
            featuredArtist: trackDef.featuredArtist || null,
          }).returning();

          await db.insert(productSongs).values({
            productId: productId,
            songId: newSong.id,
            trackOrder: Number(trackDef.trackNumber) || i + 1
          });
        }
      }
    }

    res.json({ message: 'Product natively synchronized!' });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});
