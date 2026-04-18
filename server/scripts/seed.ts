import { db } from '../src/db/db.js';
import { humans, artists, artistManagers, artistMembers, products, songs, productSongs } from '../src/db/schema.js';
import { provisionArtistDirectories } from '../src/services/mediaService.js';

async function seed() {
  console.log('Seeding Database with Temporal Schema Protocol...');
  try {
    // 1. Create Core Manager (The active Point of Contact)
    const [manager] = await db.insert(humans).values({
      firstName: 'Maurice',
      lastName: 'White',
      email: 'maurice.white@ewf.com'
    }).returning();
    
    // 2. Create the standalone Artist Brand (Earth, Wind & Fire)
    const [ewfArtist] = await db.insert(artists).values({
      stageName: 'Earth, Wind & Fire',
      bio: 'Legendary R&B, soul, funk, jazz, disco, pop, dance, Latin, and Afro pop band.',
      website: 'www.earthwindandfire.com',
      debutYear: 1969,
      isGroup: true
    }).returning();

    // 3. Temporally Map Manager -> Brand
    await db.insert(artistManagers).values({
      artistId: ewfArtist.id,
      humanId: manager.id
    });

    // 4. Create an auxiliary Group Member
    const [member] = await db.insert(humans).values({
      firstName: 'Philip',
      lastName: 'Bailey',
      email: 'philip@ewf.com'
    }).returning();

    await db.insert(artistMembers).values({
      artistId: ewfArtist.id,
      humanId: member.id,
      role: 'Lead Singer'
    });

    // 5. Generate Media File structure on disk mapping specifically to artist.id
    await provisionArtistDirectories(ewfArtist.id, ewfArtist.stageName);

    // 6. Seed Featured Products / Albums
    const [album1] = await db.insert(products).values({
      title: 'I Am',
      handle: 'i-am-ewf',
      productType: 'album',
      artistId: ewfArtist.id,
      price: '19.99',
      image: '/ewf-iam-albumcover.jpg',
      year: 1979,
      genre: 'Soul',
      stock: 50
    }).returning();

    const [album2] = await db.insert(products).values({
      title: 'That\'s the Way of the World',
      handle: 'thats-the-way',
      productType: 'album',
      artistId: ewfArtist.id,
      price: '21.99',
      image: '/ewf-thatsway-albumcover.jpg',
      year: 1975,
      genre: 'Funk',
      stock: 25
    }).returning();
    
    const [single1] = await db.insert(products).values({
      title: 'September',
      handle: 'september-single',
      productType: 'single',
      artistId: ewfArtist.id,
      price: '1.99',
      image: '/ewf-september-single.jpg',
      year: 1978,
      genre: 'Disco',
      stock: 100
    }).returning();

    console.log('Seeding Complete! Inserted Products:', [album1.title, album2.title, single1.title]);
    console.log(`Artist ID generated: ${ewfArtist.id} mapped to Stage Name: ${ewfArtist.stageName}`);
  } catch (error) {
    console.error('Seeding failed:', error);
  }
  process.exit(0);
}

seed();
