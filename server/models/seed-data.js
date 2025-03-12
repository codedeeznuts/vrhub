const db = require('../config/db');
const bcrypt = require('bcrypt');

// Sample data for seeding the database
const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Create admin user if it doesn't exist
    const adminExists = await db.query('SELECT * FROM users WHERE email = $1', ['admin@vrhub.com']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (email, password, name, is_admin, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        ['admin@vrhub.com', hashedPassword, 'Admin User', true, true, new Date()]
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create tags if they don't exist
    const tags = [
      { name: 'Action', description: 'Fast-paced and exciting VR experiences' },
      { name: 'Adventure', description: 'Explore new worlds and environments' },
      { name: 'Educational', description: 'Learn while having fun in VR' },
      { name: 'Horror', description: 'Scary and thrilling VR experiences' },
      { name: 'Meditation', description: 'Relaxing and calming VR environments' },
      { name: 'Sci-Fi', description: 'Futuristic and space-themed VR content' },
      { name: 'Sports', description: 'Athletic and competitive VR games' },
      { name: 'Travel', description: 'Visit real-world locations in VR' }
    ];

    for (const tag of tags) {
      const tagExists = await db.query('SELECT * FROM tags WHERE name = $1', [tag.name]);
      if (tagExists.rows.length === 0) {
        await db.query(
          'INSERT INTO tags (name, description) VALUES ($1, $2)',
          [tag.name, tag.description]
        );
        console.log(`Tag "${tag.name}" created`);
      } else {
        console.log(`Tag "${tag.name}" already exists`);
      }
    }

    // Create studios if they don't exist
    const studios = [
      { 
        name: 'VR Pioneers', 
        description: 'Leading the way in VR innovation',
        website: 'https://vrpioneers.example.com',
        logo_url: 'https://placehold.co/400x400/4a90e2/ffffff?text=VRP'
      },
      { 
        name: 'Immersive Worlds', 
        description: 'Creating the most immersive VR experiences',
        website: 'https://immersiveworlds.example.com',
        logo_url: 'https://placehold.co/400x400/e24a4a/ffffff?text=IW'
      },
      { 
        name: 'Reality Shift', 
        description: 'Shifting your perception of reality',
        website: 'https://realityshift.example.com',
        logo_url: 'https://placehold.co/400x400/4ae24a/ffffff?text=RS'
      },
      { 
        name: 'Virtual Visions', 
        description: 'Bringing your virtual visions to life',
        website: 'https://virtualvisions.example.com',
        logo_url: 'https://placehold.co/400x400/e2e24a/ffffff?text=VV'
      }
    ];

    for (const studio of studios) {
      const studioExists = await db.query('SELECT * FROM studios WHERE name = $1', [studio.name]);
      if (studioExists.rows.length === 0) {
        await db.query(
          'INSERT INTO studios (name, description, website, logo_url) VALUES ($1, $2, $3, $4)',
          [studio.name, studio.description, studio.website, studio.logo_url]
        );
        console.log(`Studio "${studio.name}" created`);
      } else {
        console.log(`Studio "${studio.name}" already exists`);
      }
    }

    // Get tag and studio IDs for reference
    const tagRows = await db.query('SELECT id, name FROM tags');
    const studioRows = await db.query('SELECT id, name FROM studios');
    
    const tagMap = {};
    tagRows.rows.forEach(tag => {
      tagMap[tag.name] = tag.id;
    });
    
    const studioMap = {};
    studioRows.rows.forEach(studio => {
      studioMap[studio.name] = studio.id;
    });

    // Create videos if they don't exist
    const videos = [
      {
        title: 'Space Explorer VR',
        description: 'Explore the vastness of space in this immersive VR experience',
        duration: 600, // 10 minutes
        release_date: '2023-01-15',
        thumbnail_url: 'https://placehold.co/1280x720/4a90e2/ffffff?text=Space+Explorer',
        video_url: 'https://example.com/videos/space-explorer.mp4',
        studio_id: studioMap['Virtual Visions'],
        tags: ['Sci-Fi', 'Adventure', 'Educational']
      },
      {
        title: 'Haunted Mansion',
        description: 'Dare to enter the most haunted mansion in VR history',
        duration: 900, // 15 minutes
        release_date: '2023-02-20',
        thumbnail_url: 'https://placehold.co/1280x720/e24a4a/ffffff?text=Haunted+Mansion',
        video_url: 'https://example.com/videos/haunted-mansion.mp4',
        studio_id: studioMap['Reality Shift'],
        tags: ['Horror', 'Adventure']
      },
      {
        title: 'Zen Garden Meditation',
        description: 'Find your inner peace in this calming VR meditation experience',
        duration: 1200, // 20 minutes
        release_date: '2023-03-10',
        thumbnail_url: 'https://placehold.co/1280x720/4ae24a/ffffff?text=Zen+Garden',
        video_url: 'https://example.com/videos/zen-garden.mp4',
        studio_id: studioMap['Immersive Worlds'],
        tags: ['Meditation', 'Educational']
      },
      {
        title: 'Basketball Pro VR',
        description: 'Test your basketball skills in this realistic VR sports simulation',
        duration: 450, // 7.5 minutes
        release_date: '2023-04-05',
        thumbnail_url: 'https://placehold.co/1280x720/e2e24a/ffffff?text=Basketball+Pro',
        video_url: 'https://example.com/videos/basketball-pro.mp4',
        studio_id: studioMap['VR Pioneers'],
        tags: ['Sports', 'Action']
      },
      {
        title: 'Tokyo City Tour',
        description: 'Experience the vibrant streets of Tokyo from the comfort of your home',
        duration: 1800, // 30 minutes
        release_date: '2023-05-12',
        thumbnail_url: 'https://placehold.co/1280x720/e24a90/ffffff?text=Tokyo+Tour',
        video_url: 'https://example.com/videos/tokyo-tour.mp4',
        studio_id: studioMap['Virtual Visions'],
        tags: ['Travel', 'Educational']
      },
      {
        title: 'Cyberpunk 2099',
        description: 'Immerse yourself in a futuristic cyberpunk world',
        duration: 1500, // 25 minutes
        release_date: '2023-06-18',
        thumbnail_url: 'https://placehold.co/1280x720/9c27b0/ffffff?text=Cyberpunk+2099',
        video_url: 'https://example.com/videos/cyberpunk-2099.mp4',
        studio_id: studioMap['Reality Shift'],
        tags: ['Sci-Fi', 'Action', 'Adventure']
      },
      {
        title: 'Underwater Odyssey',
        description: 'Dive deep into the ocean and discover amazing marine life',
        duration: 1350, // 22.5 minutes
        release_date: '2023-07-22',
        thumbnail_url: 'https://placehold.co/1280x720/00bcd4/ffffff?text=Underwater+Odyssey',
        video_url: 'https://example.com/videos/underwater-odyssey.mp4',
        studio_id: studioMap['Immersive Worlds'],
        tags: ['Adventure', 'Educational', 'Travel']
      },
      {
        title: 'Mountain Climbing Simulator',
        description: 'Experience the thrill of climbing the world\'s highest peaks',
        duration: 1080, // 18 minutes
        release_date: '2023-08-30',
        thumbnail_url: 'https://placehold.co/1280x720/795548/ffffff?text=Mountain+Climbing',
        video_url: 'https://example.com/videos/mountain-climbing.mp4',
        studio_id: studioMap['VR Pioneers'],
        tags: ['Sports', 'Adventure', 'Travel']
      }
    ];

    for (const video of videos) {
      const videoExists = await db.query('SELECT * FROM videos WHERE title = $1', [video.title]);
      if (videoExists.rows.length === 0) {
        // Insert video
        const videoResult = await db.query(
          `INSERT INTO videos 
           (title, description, duration, release_date, thumbnail_url, video_url, studio_id, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            video.title, 
            video.description, 
            video.duration, 
            video.release_date, 
            video.thumbnail_url, 
            video.video_url, 
            video.studio_id,
            new Date()
          ]
        );
        
        const videoId = videoResult.rows[0].id;
        
        // Add tags to video
        for (const tagName of video.tags) {
          const tagId = tagMap[tagName];
          if (tagId) {
            await db.query(
              'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2)',
              [videoId, tagId]
            );
          }
        }
        
        console.log(`Video "${video.title}" created with ${video.tags.length} tags`);
      } else {
        console.log(`Video "${video.title}" already exists`);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    // db.end();
  }
};

module.exports = seedData;

// If this script is run directly (not imported)
if (require.main === module) {
  seedData().then(() => {
    console.log('Seeding script completed');
    process.exit(0);
  }).catch(err => {
    console.error('Seeding script failed:', err);
    process.exit(1);
  });
} 