const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  handleValidationErrors
];

// Post validation
const createPostValidation = [
  body('title').notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('content').notEmpty().withMessage('Content is required'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

const updatePostValidation = [
  param('id').isInt().withMessage('Invalid post ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

// Category validation
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  handleValidationErrors
];

// Tag validation
const createTagValidation = [
  body('name').notEmpty().withMessage('Tag name is required')
    .isLength({ max: 50 }).withMessage('Tag name must be less than 50 characters'),
  handleValidationErrors
];

// Query validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term must be less than 100 characters'),
  handleValidationErrors
];

// File validation
const fileUploadValidation = [
  body('postId').optional().isInt().withMessage('Invalid post ID'),
  handleValidationErrors
];

// Download request validation
const createDownloadRequestValidation = [
  body('fileId').isInt().withMessage('Invalid file ID'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

const updateDownloadRequestValidation = [
  param('id').isInt().withMessage('Invalid request ID'),
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  loginValidation,
  registerValidation,
  createPostValidation,
  updatePostValidation,
  createCategoryValidation,
  createTagValidation,
  paginationValidation,
  fileUploadValidation,
  createDownloadRequestValidation,
  updateDownloadRequestValidation
}; 