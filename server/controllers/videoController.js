const db = require('../config/db');

// Get all videos with pagination and optional search/filtering
exports.getVideos = async (req, res) => {
  try {
    console.log('Getting videos with simplified controller...');
    
    // Simple query to get videos
    const videosResult = await db.query(`
      SELECT id, title, description, video_url, thumbnail_url, created_at
      FROM videos
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('Found videos:', videosResult.rows.length);
    
    res.json({
      videos: videosResult.rows,
      pagination: {
        page: 1,
        totalPages: 1,
        totalVideos: videosResult.rows.length
      }
    });
  } catch (err) {
    console.error('Error in getVideos:', err.message);
    console.error(err.stack);
    res.status(500).send('Server error');
  }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user ID for like status if authenticated
    const userId = req.user ? req.user.id : null;
    
    // Query for video details
    const videoResult = await db.query(`
      SELECT v.id, v.title, v.description, v.studio_id, v.video_url, v.thumbnail_url, v.created_at,
             s.name as studio_name,
             COUNT(DISTINCT l.user_id) as likes_count
             ${userId ? `, (SELECT COUNT(1) > 0 FROM likes WHERE user_id = $1 AND video_id = v.id) as is_liked` : ''}
      FROM videos v
      LEFT JOIN studios s ON v.studio_id = s.id
      LEFT JOIN likes l ON v.id = l.video_id
      WHERE v.id = $${userId ? '2' : '1'}
      GROUP BY v.id, s.name
    `, userId ? [userId, id] : [id]);
    
    if (videoResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    const video = videoResult.rows[0];
    
    // Get tags for the video
    const tagsResult = await db.query(`
      SELECT t.id, t.name
      FROM tags t
      JOIN video_tags vt ON t.id = vt.tag_id
      WHERE vt.video_id = $1
    `, [id]);
    
    video.tags = tagsResult.rows;
    
    // If user is authenticated, record view history
    if (userId) {
      try {
        // Check if user has viewed this video before
        const viewCheck = await db.query(
          'SELECT * FROM view_history WHERE user_id = $1 AND video_id = $2',
          [userId, id]
        );
        
        if (viewCheck.rows.length > 0) {
          // Update existing view history
          await db.query(
            'UPDATE view_history SET viewed_at = CURRENT_TIMESTAMP, view_count = view_count + 1 WHERE user_id = $1 AND video_id = $2',
            [userId, id]
          );
        } else {
          // Create new view history entry
          await db.query(
            'INSERT INTO view_history (user_id, video_id) VALUES ($1, $2)',
            [userId, id]
          );
        }
      } catch (viewErr) {
        console.error('Error recording view history:', viewErr);
        // Continue even if view history fails
      }
    }
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new video
exports.createVideo = async (req, res) => {
  const { title, description, studio_id, video_url, thumbnail_url, tags } = req.body;
  
  if (!title || !video_url) {
    return res.status(400).json({ msg: 'Title and video URL are required' });
  }

  try {
    // Start a transaction
    await db.query('BEGIN');
    
    // Insert video
    const videoResult = await db.query(
      'INSERT INTO videos (title, description, studio_id, video_url, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, studio_id, video_url, thumbnail_url]
    );
    
    const video = videoResult.rows[0];
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await db.query(
          'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2)',
          [video.id, tagId]
        );
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get complete video with tags and studio
    const result = await getVideoWithDetails(video.id);
    
    res.status(201).json(result);
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a video
exports.updateVideo = async (req, res) => {
  const { id } = req.params;
  const { title, description, studio_id, video_url, thumbnail_url, tags } = req.body;
  
  if (!title || !video_url) {
    return res.status(400).json({ msg: 'Title and video URL are required' });
  }

  try {
    // Check if video exists
    const videoCheck = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
    
    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Update video
    const videoResult = await db.query(
      'UPDATE videos SET title = $1, description = $2, studio_id = $3, video_url = $4, thumbnail_url = $5 WHERE id = $6 RETURNING *',
      [title, description, studio_id, video_url, thumbnail_url, id]
    );
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await db.query('DELETE FROM video_tags WHERE video_id = $1', [id]);
      
      // Add new tags
      for (const tagId of tags) {
        await db.query(
          'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2)',
          [id, tagId]
        );
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get complete video with tags and studio
    const result = await getVideoWithDetails(id);
    
    res.json(result);
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if video exists
    const videoCheck = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
    
    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Start a transaction
    await db.query('BEGIN');
    
    // Delete related records
    await db.query('DELETE FROM video_tags WHERE video_id = $1', [id]);
    await db.query('DELETE FROM likes WHERE video_id = $1', [id]);
    await db.query('DELETE FROM view_history WHERE video_id = $1', [id]);
    
    // Delete video
    await db.query('DELETE FROM videos WHERE id = $1', [id]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.json({ msg: 'Video removed' });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper function to get video with tags and studio
async function getVideoWithDetails(videoId) {
  // Get video with studio
  const videoResult = await db.query(`
    SELECT v.id, v.title, v.description, v.studio_id, v.video_url, v.thumbnail_url, v.created_at,
           s.name as studio_name,
           COUNT(l.user_id) as likes_count
    FROM videos v
    LEFT JOIN studios s ON v.studio_id = s.id
    LEFT JOIN likes l ON v.id = l.video_id
    WHERE v.id = $1
    GROUP BY v.id, s.name
  `, [videoId]);
  
  const video = videoResult.rows[0];
  
  // Get tags for the video
  const tagsResult = await db.query(`
    SELECT t.id, t.name
    FROM tags t
    JOIN video_tags vt ON t.id = vt.tag_id
    WHERE vt.video_id = $1
  `, [videoId]);
  
  video.tags = tagsResult.rows;
  
  return video;
} 