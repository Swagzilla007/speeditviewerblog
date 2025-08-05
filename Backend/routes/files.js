const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { fileUploadValidation } = require('../middleware/validation');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure public storage directory exists for featured images
const publicStorageDir = path.join(__dirname, '../public/storage');
if (!fs.existsSync(publicStorageDir)) {
  fs.mkdirSync(publicStorageDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure multer for featured image uploads (public storage)
const featuredImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicStorageDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename for featured images
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'featured-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'), false);
  }
};

const imageFilter = (req, file, cb) => {
  // Allow only image types for featured images
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed for featured images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

const featuredImageUpload = multer({
  storage: featuredImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for featured images
  }
});

// Upload file
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), fileUploadValidation, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { postId } = req.body;
    const file = req.file;

    // Create file record in database
    const [result] = await pool.execute(`
      INSERT INTO files (filename, original_name, file_path, file_size, mime_type, post_id, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      file.filename,
      file.originalname,
      file.path,
      file.size,
      file.mimetype,
      postId || null,
      req.user.id
    ]);

    // Get created file record
    const [files] = await pool.execute(`
      SELECT f.*, u.username as uploaded_by_name
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'File uploaded successfully',
      file: files[0]
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload featured image
router.post('/featured-image', authenticateToken, requireAdmin, featuredImageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const file = req.file;
    
    // Generate public URL for the uploaded image
    const publicUrl = `/storage/${file.filename}`;

    res.status(201).json({
      message: 'Featured image uploaded successfully',
      data: {
        filename: file.filename,
        original_name: file.originalname,
        url: publicUrl,
        file_size: file.size,
        mime_type: file.mimetype
      }
    });
  } catch (error) {
    console.error('Featured image upload error:', error);
    
    // Clean up uploaded file if operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all files (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, postId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    let params = [];

    if (postId) {
      whereClause += ' AND f.post_id = ?';
      params.push(postId);
    }

    // Get files with uploader info
    const [files] = await pool.execute(`
      SELECT 
        f.*, 
        u.username as uploaded_by_name,
        p.title as post_title,
        p.slug as post_slug
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      LEFT JOIN posts p ON f.post_id = p.id
      WHERE ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM files f
      WHERE ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get file by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [files] = await pool.execute(`
      SELECT 
        f.*, 
        u.username as uploaded_by_name,
        p.title as post_title,
        p.slug as post_slug
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      LEFT JOIN posts p ON f.post_id = p.id
      WHERE f.id = ?
    `, [id]);

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file: files[0] });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download file (with access control)
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info
    const [files] = await pool.execute(`
      SELECT f.*, p.status as post_status
      FROM files f
      LEFT JOIN posts p ON f.post_id = p.id
      WHERE f.id = ?
    `, [id]);

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];

    // Check if file exists on disk
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Check access permissions
    if (file.post_id) {
      // File is attached to a post
      if (file.post_status !== 'published' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Post is not published.' });
      }
    } else {
      // File is not attached to any post - admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
    }

    // Set headers for download
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Length', file.file_size);

    // Stream file to response
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update file (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { postId } = req.body;

    // Check if file exists
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update file
    await pool.execute(
      'UPDATE files SET post_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [postId || null, id]
    );

    // Get updated file
    const [updatedFiles] = await pool.execute(`
      SELECT f.*, u.username as uploaded_by_name
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = ?
    `, [id]);

    res.json({
      message: 'File updated successfully',
      file: updatedFiles[0]
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];

    // Delete file from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Delete file record from database
    await pool.execute('DELETE FROM files WHERE id = ?', [id]);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 