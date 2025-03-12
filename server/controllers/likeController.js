const db = require('../config/db');

// Toggle like on a video
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params; // video id
    const userId = req.user.id;

    // Check if video exists
    const videoCheck = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
    
    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Video not found' });
    }

    // Check if user already liked the video
    const likeCheck = await db.query(
      'SELECT * FROM likes WHERE user_id = $1 AND video_id = $2',
      [userId, id]
    );
    
    let action;
    
    if (likeCheck.rows.length > 0) {
      // User already liked the video, so unlike it
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND video_id = $2',
        [userId, id]
      );
      action = 'unliked';
    } else {
      // User hasn't liked the video, so like it
      await db.query(
        'INSERT INTO likes (user_id, video_id) VALUES ($1, $2)',
        [userId, id]
      );
      action = 'liked';
    }

    // Get updated like count
    const likesResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE video_id = $1',
      [id]
    );
    
    const likesCount = parseInt(likesResult.rows[0].count);
    
    res.json({
      action,
      likesCount,
      videoId: id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all videos liked by the current user
exports.getLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get liked videos with pagination
    const videosResult = await db.query(`
      SELECT v.id, v.title, v.description, v.video_url, v.thumbnail_url, v.created_at,
             s.id as studio_id, s.name as studio_name,
             COUNT(l2.user_id) as likes_count,
             l.created_at as liked_at
      FROM likes l
      JOIN videos v ON l.video_id = v.id
      LEFT JOIN studios s ON v.studio_id = s.id
      LEFT JOIN likes l2 ON v.id = l2.video_id
      WHERE l.user_id = $1
      GROUP BY v.id, s.id, l.created_at
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count of liked videos
    const countResult = await db.query(
      'SELECT COUNT(*) FROM likes WHERE user_id = $1',
      [userId]
    );

    // Get tags for each video
    const videos = await Promise.all(
      videosResult.rows.map(async (video) => {
        const tagsResult = await db.query(`
          SELECT t.id, t.name
          FROM tags t
          JOIN video_tags vt ON t.id = vt.tag_id
          WHERE vt.video_id = $1
        `, [video.id]);

        return {
          ...video,
          tags: tagsResult.rows
        };
      })
    );

    // Calculate total pages
    const totalVideos = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalVideos / limit);

    res.json({
      videos,
      pagination: {
        page,
        limit,
        totalVideos,
        totalPages
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 