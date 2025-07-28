const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createCategoryValidation } = require('../middleware/validation');

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

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        COUNT(DISTINCT pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
      WHERE c.slug = ?
      GROUP BY c.id
    `, [slug]);

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: categories[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new category (admin only)
router.post('/', authenticateToken, requireAdmin, createCategoryValidation, async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = createSlug(name);

    // Check if slug already exists
    const [existingCategories] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );

    if (existingCategories.length > 0) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    // Create category
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description]
    );

    // Get created category
    const [newCategories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategories[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, createCategoryValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const [existingCategories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    if (existingCategories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = existingCategories[0];
    let slug = category.slug;

    // Update slug if name changed
    if (name && name !== category.name) {
      slug = createSlug(name);
      
      // Check if new slug already exists
      const [slugCheck] = await pool.execute(
        'SELECT id FROM categories WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'A category with this name already exists' });
      }
    }

    // Update category
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name || category.name, slug, description || category.description, id]
    );

    // Get updated category
    const [updatedCategories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategories[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [categories] = await pool.execute(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has posts
    const [postCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM post_categories WHERE category_id = ?',
      [id]
    );

    if (postCount[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has posts. Please reassign or delete the posts first.' 
      });
    }

    // Delete category
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 