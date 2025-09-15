const express = require('express');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { createPostValidation, updatePostValidation, paginationValidation } = require('../middleware/validation');

const router = express.Router();

// Helper function to create slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Get all posts (public - with optional auth for additional features)
router.get('/', optionalAuth, paginationValidation, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, tag, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    // Handle status filtering
    if (status) {
      // If status is provided, filter by it
      whereConditions.push('p.status = ?');
      params.push(status);
    } else if (req.user && req.user.role === 'admin') {
      // If no status provided and user is admin, show all posts
      // No status condition added
    } else {
      // If no status provided and user is not admin, default to published
      whereConditions.push('p.status = ?');
      params.push('published');
    }

    // Add search condition
    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add category filter
    if (category) {
      whereConditions.push('c.slug = ?');
      params.push(category);
    }

    // Add tag filter
    if (tag) {
      whereConditions.push('t.slug = ?');
      params.push(tag);
    }

    const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

    // Get posts with author, categories, and tags
    const [posts] = await pool.execute(`
      SELECT DISTINCT 
        p.id, p.title, p.slug, p.excerpt, p.featured_image, 
        p.status, p.views_count, p.created_at, p.published_at,
        u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.published_at DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get categories and tags for each post
    const postsWithRelations = await Promise.all(posts.map(async (post) => {
      const [categories] = await pool.execute(`
        SELECT c.id, c.name, c.slug, c.description
        FROM categories c
        INNER JOIN post_categories pc ON c.id = pc.category_id
        WHERE pc.post_id = ?
      `, [post.id]);

      const [tags] = await pool.execute(`
        SELECT t.id, t.name, t.slug
        FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `, [post.id]);

      return {
        ...post,
        author: {
          id: post.author_id,
          username: post.author_name
        },
        categories: categories,
        tags: tags
      };
    }));

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      posts: postsWithRelations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get post with author
    const [posts] = await pool.execute(`
      SELECT 
        p.*, u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ?
    `, [slug]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Get categories for this post
    const [categories] = await pool.execute(`
      SELECT c.id, c.name, c.slug, c.description
      FROM categories c
      INNER JOIN post_categories pc ON c.id = pc.category_id
      WHERE pc.post_id = ?
    `, [post.id]);

    // Get tags for this post
    const [tags] = await pool.execute(`
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [post.id]);

    // Get files associated with this post
    const [files] = await pool.execute(`
      SELECT id, filename, original_name, file_path, file_size, mime_type, 
             post_id, uploaded_by, download_count, created_at
      FROM files
      WHERE post_id = ?
    `, [post.id]);

    // Increment view count for published posts
    if (post.status === 'published') {
      await pool.execute(
        'UPDATE posts SET views_count = views_count + 1 WHERE id = ?',
        [post.id]
      );
    }

    // Get related posts (same categories or tags)
    const [relatedPosts] = await pool.execute(`
      SELECT DISTINCT 
        p.id, p.title, p.slug, p.excerpt, p.featured_image, p.published_at,
        u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      WHERE p.status = 'published' 
        AND p.id != ?
        AND (pc.category_id IN (
          SELECT category_id FROM post_categories WHERE post_id = ?
        ) OR pt.tag_id IN (
          SELECT tag_id FROM post_tags WHERE post_id = ?
        ))
      GROUP BY p.id
      ORDER BY p.published_at DESC
      LIMIT 5
    `, [post.id, post.id, post.id]);

    res.json({
      post: {
        ...post,
        author: {
          id: post.author_id,
          username: post.author_name
        },
        categories: categories,
        tags: tags,
        files: files
      },
      relatedPosts
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new post (admin only)
router.post('/', authenticateToken, requireAdmin, createPostValidation, async (req, res) => {
  try {
    console.log('Create post request body:', req.body);
    const { title, content, excerpt, featured_image, status, categories, tags, file_ids } = req.body;
    console.log('Extracted featured_image:', featured_image);
    const slug = createSlug(title);

    // Check if slug already exists
    const [existingPosts] = await pool.execute(
      'SELECT id FROM posts WHERE slug = ?',
      [slug]
    );

    if (existingPosts.length > 0) {
      return res.status(400).json({ error: 'A post with this title already exists' });
    }

    // Create post
    console.log('Inserting post with featured_image:', featured_image);
    console.log('Featured image type:', typeof featured_image);
    console.log('Featured image length:', featured_image ? featured_image.length : 'null/undefined');
    
    const insertParams = [
      title, 
      slug, 
      content, 
      excerpt, 
      featured_image, 
      status, 
      req.user.id,
      status === 'published' ? new Date() : null
    ];
    
    console.log('Insert parameters:', insertParams);
    
    const [result] = await pool.execute(`
      INSERT INTO posts (title, slug, content, excerpt, featured_image, status, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, insertParams);

    const postId = result.insertId;

    // Add categories
    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        await pool.execute(
          'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
          [postId, categoryId]
        );
      }
    }

    // Add tags
    if (tags && tags.length > 0) {
      for (const tagId of tags) {
        await pool.execute(
          'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
          [postId, tagId]
        );
      }
    }
    
    // Associate files with the post
    if (file_ids && file_ids.length > 0) {
      console.log('Associating files with new post:', file_ids);
      for (const fileId of file_ids) {
        await pool.execute(
          'UPDATE files SET post_id = ? WHERE id = ?',
          [postId, fileId]
        );
      }
    }

    // Get created post
    const [newPosts] = await pool.execute(`
      SELECT 
        p.*, u.username as author_name,
        GROUP_CONCAT(DISTINCT c.name) as categories,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [postId]);

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...newPosts[0],
        categories: newPosts[0].categories ? newPosts[0].categories.split(',') : [],
        tags: newPosts[0].tags ? newPosts[0].tags.split(',') : []
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post (admin only)
router.put('/:id', authenticateToken, requireAdmin, updatePostValidation, async (req, res) => {
  try {
    console.log('Update post request body:', req.body);
    const { id } = req.params;
    const { title, content, excerpt, featured_image, status, categories, tags, file_ids } = req.body;
    console.log('Extracted featured_image for update:', featured_image);

    // Check if post exists
    const [existingPosts] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );

    if (existingPosts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = existingPosts[0];
    let slug = post.slug;

    // Update slug if title changed
    if (title && title !== post.title) {
      slug = createSlug(title);
      
      // Check if new slug already exists
      const [slugCheck] = await pool.execute(
        'SELECT id FROM posts WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ error: 'A post with this title already exists' });
      }
    }

    // Update post
    console.log('Updating post with featured_image:', featured_image || post.featured_image);
    await pool.execute(`
      UPDATE posts 
      SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?, 
          status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || post.title,
      slug,
      content || post.content,
      excerpt || post.excerpt,
      featured_image || post.featured_image,
      status || post.status,
      status === 'published' && post.status !== 'published' ? new Date() : post.published_at,
      id
    ]);

    // Update categories
    if (categories !== undefined) {
      // Remove existing categories
      await pool.execute('DELETE FROM post_categories WHERE post_id = ?', [id]);
      
      // Add new categories
      if (categories.length > 0) {
        for (const categoryId of categories) {
          await pool.execute(
            'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        }
      }
    }

    // Update tags
    if (tags !== undefined) {
      // Remove existing tags
      await pool.execute('DELETE FROM post_tags WHERE post_id = ?', [id]);
      
      // Add new tags
      if (tags.length > 0) {
        for (const tagId of tags) {
          await pool.execute(
            'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }
    
    // Update file associations
    if (file_ids) {
      console.log('Updating file associations:', file_ids);
      // Update file associations in the database
      for (const fileId of file_ids) {
        await pool.execute(
          'UPDATE files SET post_id = ? WHERE id = ?',
          [id, fileId]
        );
      }
    }

    // Get updated post
    const [updatedPosts] = await pool.execute(`
      SELECT 
        p.*, u.username as author_name,
        GROUP_CONCAT(DISTINCT c.name) as categories,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    res.json({
      message: 'Post updated successfully',
      post: {
        ...updatedPosts[0],
        categories: updatedPosts[0].categories ? updatedPosts[0].categories.split(',') : [],
        tags: updatedPosts[0].tags ? updatedPosts[0].tags.split(',') : []
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get counts in parallel
    const [postsCount] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    const [publishedPostsCount] = await pool.execute("SELECT COUNT(*) as total FROM posts WHERE status = 'published'");
    const [draftPostsCount] = await pool.execute("SELECT COUNT(*) as total FROM posts WHERE status = 'draft'");
    const [categoriesCount] = await pool.execute('SELECT COUNT(*) as total FROM categories');
    const [tagsCount] = await pool.execute('SELECT COUNT(*) as total FROM tags');
    const [filesCount] = await pool.execute('SELECT COUNT(*) as total FROM files');
    const [requestsCount] = await pool.execute('SELECT COUNT(*) as total FROM download_requests');
    const [pendingRequestsCount] = await pool.execute("SELECT COUNT(*) as total FROM download_requests WHERE status = 'pending'");
    const [usersCount] = await pool.execute('SELECT COUNT(*) as total FROM users');

    res.json({
      totalPosts: postsCount[0].total,
      publishedPosts: publishedPostsCount[0].total,
      draftPosts: draftPostsCount[0].total,
      totalCategories: categoriesCount[0].total,
      totalTags: tagsCount[0].total,
      totalFiles: filesCount[0].total,
      totalRequests: requestsCount[0].total,
      pendingRequests: pendingRequestsCount[0].total,
      totalUsers: usersCount[0].total
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post by ID (admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get post with author, categories, tags, and files
    const [posts] = await pool.execute(`
      SELECT 
        p.*, u.username as author_name,
        GROUP_CONCAT(DISTINCT c.id) as category_ids,
        GROUP_CONCAT(DISTINCT c.name) as category_names,
        GROUP_CONCAT(DISTINCT t.id) as tag_ids,
        GROUP_CONCAT(DISTINCT t.name) as tag_names
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Get files associated with this post
    const [files] = await pool.execute(`
      SELECT * FROM files WHERE post_id = ?
    `, [id]);

    // Get categories and tags as objects
    const [categories] = await pool.execute(`
      SELECT c.* FROM categories c
      INNER JOIN post_categories pc ON c.id = pc.category_id
      WHERE pc.post_id = ?
    `, [id]);

    const [tags] = await pool.execute(`
      SELECT t.* FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [id]);

    res.json({
      post: {
        ...post,
        categories,
        tags,
        files
      }
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and get featured image info
    const [posts] = await pool.execute(
      'SELECT id, featured_image FROM posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Delete featured image file from storage if it exists
    if (post.featured_image) {
      try {
        // Extract filename from the URL
        const urlParts = post.featured_image.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        if (filename) {
          const filePath = path.join(__dirname, '../public/storage', filename);
          
          // Check if file exists and delete it
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted featured image file: ${filename}`);
          }
        }
      } catch (fileError) {
        console.error('Error deleting featured image file:', fileError);
        // Don't fail the entire operation if file deletion fails
      }
    }

    // Delete post (cascading will handle related records)
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 