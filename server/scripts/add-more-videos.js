 const db = require('../config/db');

/**
 * Script to add 30 more videos to the database for pagination testing
 */
const addMoreVideos = async () => {
  try {
    console.log('Starting to add 30 more videos for pagination testing...');

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

    // List of studio names for easy reference
    const studioNames = Object.keys(studioMap);
    
    // List of tag names for easy reference
    const tagNames = Object.keys(tagMap);

    // Generate 30 videos with different titles, descriptions, etc.
    for (let i = 1; i <= 30; i++) {
      // Generate a random title
      const title = `VR Experience ${i}`;
      
      // Check if video already exists
      const videoExists = await db.query('SELECT * FROM videos WHERE title = $1', [title]);
      if (videoExists.rows.length > 0) {
        console.log(`Video "${title}" already exists, skipping...`);
        continue;
      }
      
      // Generate random studio
      const studioName = studioNames[Math.floor(Math.random() * studioNames.length)];
      const studioId = studioMap[studioName];
      
      // Generate random duration (5-30 minutes)
      const duration = Math.floor(Math.random() * 1500) + 300; // 300-1800 seconds
      
      // Generate random release date in the last 2 years
      const today = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      const randomDate = new Date(twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime()));
      const releaseDate = randomDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Generate random color for thumbnail
      const colors = ['4a90e2', 'e24a4a', '4ae24a', 'e2e24a', 'e24a90', '9c27b0', '00bcd4', '795548', 'ff9800', '607d8b'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Generate random description
      const descriptions = [
        `An immersive journey into ${i} different virtual worlds`,
        `Experience the thrill of ${title} in full VR`,
        `Discover new dimensions with this cutting-edge VR experience`,
        `A mind-bending adventure that pushes the boundaries of VR`,
        `Relax and unwind with this peaceful VR experience`
      ];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Generate thumbnail URL
      const thumbnailUrl = `https://placehold.co/1280x720/${randomColor}/ffffff?text=VR+Experience+${i}`;
      
      // Generate video URL
      const videoUrl = `https://example.com/videos/vr-experience-${i}.mp4`;
      
      // Select 2-3 random tags
      const numTags = Math.floor(Math.random() * 2) + 2; // 2-3 tags
      const selectedTags = [];
      while (selectedTags.length < numTags) {
        const randomTag = tagNames[Math.floor(Math.random() * tagNames.length)];
        if (!selectedTags.includes(randomTag)) {
          selectedTags.push(randomTag);
        }
      }
      
      // Insert video
      const videoResult = await db.query(
        `INSERT INTO videos 
         (title, description, duration, release_date, thumbnail_url, video_url, studio_id, created_at, views) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          title, 
          description, 
          duration, 
          releaseDate, 
          thumbnailUrl, 
          videoUrl, 
          studioId,
          new Date(),
          Math.floor(Math.random() * 1000) // Random view count between 0-999
        ]
      );
      
      const videoId = videoResult.rows[0].id;
      
      // Add tags to video
      for (const tagName of selectedTags) {
        const tagId = tagMap[tagName];
        if (tagId) {
          await db.query(
            'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2)',
            [videoId, tagId]
          );
        }
      }
      
      console.log(`Video "${title}" created with ${selectedTags.length} tags`);
    }

    console.log('Successfully added new videos for pagination testing');
  } catch (error) {
    console.error('Error adding videos:', error);
  }
  // Removed db.end() as it's not available in the pool implementation
};

// Run the function if this script is executed directly
if (require.main === module) {
  addMoreVideos().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
} 