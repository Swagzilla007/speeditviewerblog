const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createTagValidation } = require('../middleware/validation');

const router = express.Router();

// Helper function to create slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Get all tags
router.get('/', async (req, res) => {
  try {
    const [tags] = await pool.execute(`
      SELECT 
        t.*,
        COUNT(DISTINCT pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      ORDER BY t.name ASC
    `);

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tag by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [tags] = await pool.execute(`
      SELECT 
        t.*,
        COUNT(DISTINCT pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      WHERE t.slug = ?
      GROUP BY t.id
    `, [slug]);

    if (tags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ tag: tags[0] });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new tag (admin only)
router.post('/', authenticateToken, requireAdmin, createTagValidation, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = createSlug(name);

    // Check if slug already exists
    const [existingTags] = await pool.execute(
      'SELECT id FROM tags WHERE slug = ?',
      [slug]
    );

    if (existingTags.length > 0) {
      return res.status(400).json({ error: 'A tag with this name already exists' });
    }

    // Create tag
    const [result] = await pool.execute(
      'INSERT INTO tags (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    // Get created tag
    const [newTags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Tag created successfully',
      tag: newTags[0]
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tag (admin only)
router.put('/:id', authenticateToken, requireAdmin, createTagValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if tag exists
    const [existingTags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );

    if (existingTags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const tag = existingTags[0];
    let slug = tag.slug;

    // Update slug if name changed
    if (name && name !== tag.name) {
      slug = createSlug(name);
      
      // Check if new slug already exists
      const [slugCheck] = await pool.execute(
        'SELECT id FROM tags WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'A tag with this name already exists' });
      }
    }

    // Update tag
    await pool.execute(
      'UPDATE tags SET name = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || tag.name, slug, id]
    );

    // Get updated tag
    const [updatedTags] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Tag updated successfully',
      tag: updatedTags[0]
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tag (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const [tags] = await pool.execute(
      'SELECT id FROM tags WHERE id = ?',
      [id]
    );

    if (tags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if tag has posts
    const [postCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?',
      [id]
    );

    if (postCount[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tag that has posts. Please remove the tag from posts first.' 
      });
    }

    // Delete tag
    await pool.execute('DELETE FROM tags WHERE id = ?', [id]);

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 