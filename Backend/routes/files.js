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

// Ensure content images directory exists
const contentImagesDir = path.join(__dirname, '../public/storage/content-images');
if (!fs.existsSync(contentImagesDir)) {
  fs.mkdirSync(contentImagesDir, { recursive: true });
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

// Configure multer for content image uploads (public storage)
const contentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, contentImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename for content images
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'content-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text and code files
    'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed',
    // Programming files
    'text/html', 'text/css', 'application/javascript', 'text/javascript',
    'application/json', 'application/xml', 'text/xml', 'text/markdown',
    'application/sql', 'application/x-sql', 'text/x-sql',
    'text/x-java-source', 'text/x-python', 'text/x-c', 'text/x-c++',
    'text/x-php', 'text/x-ruby', 'text/x-typescript',
    'application/x-httpd-php', 'application/x-sh'
  ];

  // Also check file extension for programming files that might not have proper MIME types
  const allowedExtensions = [
    '.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx',
    '.json', '.xml', '.md', '.markdown',
    '.sql', '.java', '.py', '.c', '.cpp', '.h', '.cs',
    '.php', '.rb', '.go', '.sh', '.bat', '.ps1',
    '.yml', '.yaml', '.toml', '.ini', '.conf'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed files: images, documents, programming files (HTML, CSS, JavaScript, SQL, Java, Python, etc.), and archives.'), false);
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
    console.log('Files query parameters:', req.query);
    // Extract and normalize parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { postId, fileType } = req.query;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    let params = [];

    if (postId) {
      whereClause += ' AND f.post_id = ?';
      params.push(postId);
    }
    
    // Filter by file type (featured image vs attached file)
    if (fileType === 'featured') {
      whereClause += ' AND f.filename LIKE ?';
      params.push('featured-%');
    } else if (fileType === 'attached') {
      whereClause += ' AND f.filename NOT LIKE ?';
      params.push('featured-%');
    }
    
    // All files require approval - removed is_public filter
    
    // Filter by search term
    if (search && search.trim() !== '') {
      console.log('Searching files with term:', search);
      whereClause += ' AND (f.original_name LIKE ? OR f.filename LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      
      console.log(`Search patterns: 
        - original_name LIKE '${searchTerm}' 
        - filename LIKE '${searchTerm}'`);
    }

    // Get files with uploader info
    const query = `
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
    `;
    
    const queryParams = [...params, parseInt(limit), offset];
    
    console.log('Executing SQL query:', query);
    console.log('With parameters:', queryParams);
    
    const [files] = await pool.execute(query, queryParams);
    
    console.log(`Search results: Found ${files.length} files`);
    if (search && files.length === 0) {
      console.log('No files found matching search criteria. Dumping first 10 file names for comparison:');
      const [allFiles] = await pool.execute(
        'SELECT id, original_name, filename FROM files LIMIT 10'
      );
      console.log(allFiles);
    }

    // Get total count - make sure we use the same FROM clause and JOIN statements as the main query
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      LEFT JOIN posts p ON f.post_id = p.id
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

    // Admins always have access
    if (req.user.role === 'admin') {
      // Set headers for download
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
      res.setHeader('Content-Length', file.file_size);
      return fs.createReadStream(file.file_path).pipe(res);
    }
    
    // Check if user has an approved download request for this file
    const [approvedRequests] = await pool.execute(`
      SELECT id FROM download_requests 
      WHERE user_id = ? AND file_id = ? AND status = 'approved'
    `, [req.user.id, id]);
    
    if (approvedRequests.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied. You need an approved download request for this file.',
        needsRequest: true 
      });
    }
    
    // Increment download count
    await pool.execute(`
      UPDATE files SET download_count = download_count + 1 
      WHERE id = ?
    `, [id]);
    
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
    const { postId, original_name } = req.body;

    // Check if file exists
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [id]
    );

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update file
    // Instead of description (which doesn't exist), we update original_name if provided
    
    if (original_name) {
      await pool.execute(
        'UPDATE files SET post_id = ?, original_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [postId || null, original_name, id]
      );
    } else {
      await pool.execute(
        'UPDATE files SET post_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [postId || null, id]
      );
    }

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

// Upload content image for post editor
// This endpoint doesn't require authentication since it's used in the rich text editor
const uploadContentImage = multer({
  storage: contentImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

router.post('/content-images', (req, res) => {
  uploadContentImage(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ error: err.message });
    }

    // No error, file uploaded successfully
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create URL for the uploaded file
    const relativePath = '/storage/content-images/' + req.file.filename;
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      url: relativePath,
      filename: req.file.filename
    });
  });
});

module.exports = router; 