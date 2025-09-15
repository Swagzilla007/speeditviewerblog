const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createDownloadRequestValidation, updateDownloadRequestValidation, paginationValidation } = require('../middleware/validation');

const router = express.Router();

// Check if user has requested a file
router.get('/check/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get the most recent request for this file from this user
    const [requests] = await pool.execute(`
      SELECT * FROM download_requests
      WHERE user_id = ? AND file_id = ?
      ORDER BY request_date DESC
      LIMIT 1
    `, [req.user.id, fileId]);
    
    if (requests.length === 0) {
      return res.json({ requested: false, status: null });
    }
    
    // Return request status
    return res.json({ 
      requested: true, 
      status: requests[0].status,
      requestId: requests[0].id,
      createdAt: requests[0].request_date
    });
  } catch (error) {
    console.error('Check download request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create download request
router.post('/', authenticateToken, createDownloadRequestValidation, async (req, res) => {
  try {
    const { fileId, notes } = req.body;

    // Check if file exists
    const [files] = await pool.execute(`
      SELECT f.*, p.status as post_status
      FROM files f
      LEFT JOIN posts p ON f.post_id = p.id
      WHERE f.id = ?
    `, [fileId]);

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];

    // Check if user already has a pending request for this file
    const [existingRequests] = await pool.execute(
      'SELECT id FROM download_requests WHERE user_id = ? AND file_id = ? AND status = "pending"',
      [req.user.id, fileId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ error: 'You already have a pending request for this file' });
    }

    // Create download request
    const [result] = await pool.execute(`
      INSERT INTO download_requests (user_id, file_id, notes)
      VALUES (?, ?, ?)
    `, [req.user.id, fileId, notes || null]);

    // Get created request with file and user info
    const [requests] = await pool.execute(`
      SELECT 
        dr.*,
        f.original_name as file_name,
        f.file_size,
        f.mime_type,
        u.username as requester_name,
        p.title as post_title
      FROM download_requests dr
      LEFT JOIN files f ON dr.file_id = f.id
      LEFT JOIN users u ON dr.user_id = u.id
      LEFT JOIN posts p ON f.post_id = p.id
      WHERE dr.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Download request created successfully',
      request: requests[0]
    });
  } catch (error) {
    console.error('Create download request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's download requests
router.get('/my-requests', authenticateToken, paginationValidation, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['dr.user_id = ?'];
    let params = [req.user.id];

    if (status) {
      whereConditions.push('dr.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get user's requests
    const [requests] = await pool.execute(`
      SELECT 
        dr.*,
        f.original_name as file_name,
        f.file_size,
        f.mime_type,
        p.title as post_title,
        p.slug as post_slug,
        u2.username as approver_name
      FROM download_requests dr
      LEFT JOIN files f ON dr.file_id = f.id
      LEFT JOIN posts p ON f.post_id = p.id
      LEFT JOIN users u2 ON dr.approved_by = u2.id
      WHERE ${whereClause}
      ORDER BY dr.request_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM download_requests dr
      WHERE ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all download requests (admin only)
router.get('/', authenticateToken, requireAdmin, paginationValidation, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let params = [];

    if (status) {
      whereConditions.push('dr.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get all requests
    const [requests] = await pool.execute(`
      SELECT 
        dr.*,
        f.original_name as file_name,
        f.file_size,
        f.mime_type,
        p.title as post_title,
        p.slug as post_slug,
        u1.username as requester_name,
        u2.username as approver_name
      FROM download_requests dr
      LEFT JOIN files f ON dr.file_id = f.id
      LEFT JOIN posts p ON f.post_id = p.id
      LEFT JOIN users u1 ON dr.user_id = u1.id
      LEFT JOIN users u2 ON dr.approved_by = u2.id
      WHERE ${whereClause}
      ORDER BY dr.request_date DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM download_requests dr
      WHERE ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single download request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.execute(`
      SELECT 
        dr.*,
        f.original_name as file_name,
        f.file_size,
        f.mime_type,
        p.title as post_title,
        p.slug as post_slug,
        u1.username as requester_name,
        u2.username as approver_name
      FROM download_requests dr
      LEFT JOIN files f ON dr.file_id = f.id
      LEFT JOIN posts p ON f.post_id = p.id
      LEFT JOIN users u1 ON dr.user_id = u1.id
      LEFT JOIN users u2 ON dr.approved_by = u2.id
      WHERE dr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Download request not found' });
    }

    const request = requests[0];

    // Check if user can access this request
    if (request.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update download request status (admin only)
router.put('/:id', authenticateToken, requireAdmin, updateDownloadRequestValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if request exists
    const [requests] = await pool.execute(
      'SELECT * FROM download_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Download request not found' });
    }

    const request = requests[0];

    // Update request
    await pool.execute(`
      UPDATE download_requests 
      SET status = ?, notes = ?, approved_date = ?, approved_by = ?
      WHERE id = ?
    `, [
      status,
      notes !== undefined ? notes : request.notes, // Only update notes if provided
      // Set approved_date to current date when status is 'approved' or 'rejected'
      // Set to null when status is 'pending'
      status !== 'pending' ? new Date() : null,
      // Set approved_by to current user when status is 'approved' or 'rejected'
      // Set to null when status is 'pending'
      status !== 'pending' ? req.user.id : null,
      id
    ]);

    // Get updated request
    const [updatedRequests] = await pool.execute(`
      SELECT 
        dr.*,
        f.original_name as file_name,
        f.file_size,
        f.mime_type,
        p.title as post_title,
        p.slug as post_slug,
        u1.username as requester_name,
        u2.username as approver_name
      FROM download_requests dr
      LEFT JOIN files f ON dr.file_id = f.id
      LEFT JOIN posts p ON f.post_id = p.id
      LEFT JOIN users u1 ON dr.user_id = u1.id
      LEFT JOIN users u2 ON dr.approved_by = u2.id
      WHERE dr.id = ?
    `, [id]);

    res.json({
      message: 'Download request updated successfully',
      request: updatedRequests[0]
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete download request (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const [requests] = await pool.execute(
      'SELECT id FROM download_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Download request not found' });
    }

    // Delete request
    await pool.execute('DELETE FROM download_requests WHERE id = ?', [id]);

    res.json({ message: 'Download request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 