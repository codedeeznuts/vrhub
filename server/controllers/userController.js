const bcrypt = require('bcrypt');
const db = require('../config/db');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, name, is_admin, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, email, name, is_admin, is_active, created_at
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  const { email, password, name, is_admin, is_active } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = await db.query(`
      INSERT INTO users (email, password, name, is_admin, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, is_admin, is_active, created_at
    `, [
      email,
      hashedPassword,
      name || null,
      is_admin === true,
      is_active === false ? false : true
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a user (admin only, or self)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, name, is_admin, is_active } = req.body;
  
  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // If not admin and not updating self, deny access
    if (!req.user.is_admin && req.user.id !== parseInt(id)) {
      return res.status(403).json({ msg: 'Not authorized to update this user' });
    }
    
    // If not admin, can't change is_admin or is_active status
    if (!req.user.is_admin && (is_admin !== undefined || is_active !== undefined)) {
      return res.status(403).json({ msg: 'Not authorized to change admin or active status' });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== userCheck.rows[0].email) {
      const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }
    
    // Build update query
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (email) {
      updateFields.push(`email = $${paramIndex}`);
      queryParams.push(email);
      paramIndex++;
    }
    
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      queryParams.push(name || null);
      paramIndex++;
    }
    
    if (password) {
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      updateFields.push(`password = $${paramIndex}`);
      queryParams.push(hashedPassword);
      paramIndex++;
    }
    
    if (req.user.is_admin && is_admin !== undefined) {
      updateFields.push(`is_admin = $${paramIndex}`);
      queryParams.push(is_admin);
      paramIndex++;
    }
    
    if (req.user.is_admin && is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      queryParams.push(is_active);
      paramIndex++;
    }
    
    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ msg: 'No fields to update' });
    }
    
    // Add id to params
    queryParams.push(id);
    
    // Update user
    const result = await db.query(`
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, is_admin, is_active, created_at
    `, queryParams);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent deleting self
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }
    
    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile (self only)
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }
    
    // Update profile
    const result = await db.query(`
      UPDATE users
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, email, name, is_admin, is_active, created_at
    `, [name || null, email || req.user.email, userId]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Change password (self only)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Current password and new password are required' });
  }
  
  try {
    // Get current user with password
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get liked videos for current user
exports.getLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT v.id, v.title, v.description, v.studio_id, v.video_url, v.thumbnail_url, v.created_at,
             s.name as studio_name,
             l.created_at as liked_at
      FROM likes l
      JOIN videos v ON l.video_id = v.id
      LEFT JOIN studios s ON v.studio_id = s.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);
    
    // Get tags for each video
    const videos = await Promise.all(
      result.rows.map(async (video) => {
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
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get watch history for current user
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT vh.id, vh.video_id, vh.viewed_at, vh.progress, vh.view_count,
             v.title, v.thumbnail_url, v.studio_id,
             s.name as studio_name
      FROM view_history vh
      JOIN videos v ON vh.video_id = v.id
      LEFT JOIN studios s ON v.studio_id = s.id
      WHERE vh.user_id = $1
      ORDER BY vh.viewed_at DESC
    `, [userId]);
    
    // Format response
    const history = result.rows.map(item => ({
      _id: item.id,
      watchedAt: item.viewed_at,
      progress: item.progress,
      viewCount: item.view_count,
      video: {
        _id: item.video_id,
        title: item.title,
        thumbnailUrl: item.thumbnail_url,
        studio: item.studio_id ? {
          _id: item.studio_id,
          name: item.studio_name
        } : null
      }
    }));
    
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Clear watch history for current user
exports.clearWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query('DELETE FROM view_history WHERE user_id = $1', [userId]);
    
    res.json({ msg: 'Watch history cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 