const db = require('../config/db');

// Get all tags
exports.getTags = async (req, res) => {
  try {
    // Update query to include video count for each tag
    const result = await db.query(`
      SELECT t.id, t.name, t.description, t.thumbnail_url, 
             COUNT(vt.video_id) as video_count
      FROM tags t
      LEFT JOIN video_tags vt ON t.id = vt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single tag by ID (keeping for backward compatibility)
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM tags WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tag not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single tag by name
exports.getTagByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Use case-insensitive search
    const result = await db.query('SELECT * FROM tags WHERE LOWER(name) = LOWER($1)', [name]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Tag not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new tag
exports.createTag = async (req, res) => {
  const { name, thumbnail_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ msg: 'Tag name is required' });
  }

  try {
    // Check if tag already exists
    const tagCheck = await db.query('SELECT * FROM tags WHERE name = $1', [name]);
    
    if (tagCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Tag already exists' });
    }
    
    const result = await db.query(
      'INSERT INTO tags (name, thumbnail_url) VALUES ($1, $2) RETURNING *',
      [name, thumbnail_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a tag
exports.updateTag = async (req, res) => {
  const { id } = req.params;
  const { name, thumbnail_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ msg: 'Tag name is required' });
  }

  try {
    // Check if tag exists
    const tagCheck = await db.query('SELECT * FROM tags WHERE id = $1', [id]);
    
    if (tagCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Tag not found' });
    }
    
    // Check if new name already exists for another tag
    const nameCheck = await db.query(
      'SELECT * FROM tags WHERE name = $1 AND id != $2',
      [name, id]
    );
    
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Tag name already exists' });
    }
    
    const result = await db.query(
      'UPDATE tags SET name = $1, thumbnail_url = $2 WHERE id = $3 RETURNING *',
      [name, thumbnail_url || tagCheck.rows[0].thumbnail_url, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if tag exists
    const tagCheck = await db.query('SELECT * FROM tags WHERE id = $1', [id]);
    
    if (tagCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Tag not found' });
    }
    
    // Check if tag is used in any videos
    const videoCheck = await db.query(
      'SELECT * FROM video_tags WHERE tag_id = $1 LIMIT 1',
      [id]
    );
    
    if (videoCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete tag that is used by videos' });
    }
    
    await db.query('DELETE FROM tags WHERE id = $1', [id]);
    
    res.json({ msg: 'Tag removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 