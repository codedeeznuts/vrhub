const db = require('../config/db');

// Get all studios
exports.getStudios = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM studios ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single studio by ID (keeping for backward compatibility)
exports.getStudioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM studios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Studio not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a single studio by name
exports.getStudioByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Use case-insensitive search
    const result = await db.query('SELECT * FROM studios WHERE LOWER(name) = LOWER($1)', [name]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Studio not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a new studio
exports.createStudio = async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ msg: 'Studio name is required' });
  }

  try {
    // Check if studio already exists
    const studioCheck = await db.query('SELECT * FROM studios WHERE name = $1', [name]);
    
    if (studioCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Studio already exists' });
    }
    
    const result = await db.query(
      'INSERT INTO studios (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a studio
exports.updateStudio = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ msg: 'Studio name is required' });
  }

  try {
    // Check if studio exists
    const studioCheck = await db.query('SELECT * FROM studios WHERE id = $1', [id]);
    
    if (studioCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Studio not found' });
    }
    
    // Check if new name already exists for another studio
    const nameCheck = await db.query(
      'SELECT * FROM studios WHERE name = $1 AND id != $2',
      [name, id]
    );
    
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Studio name already exists' });
    }
    
    const result = await db.query(
      'UPDATE studios SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a studio
exports.deleteStudio = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if studio exists
    const studioCheck = await db.query('SELECT * FROM studios WHERE id = $1', [id]);
    
    if (studioCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Studio not found' });
    }
    
    // Check if studio is used in any videos
    const videoCheck = await db.query(
      'SELECT * FROM videos WHERE studio_id = $1 LIMIT 1',
      [id]
    );
    
    if (videoCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete studio that is used by videos' });
    }
    
    await db.query('DELETE FROM studios WHERE id = $1', [id]);
    
    res.json({ msg: 'Studio removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 