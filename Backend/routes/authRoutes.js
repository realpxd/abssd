const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  register,
  login,
  adminLogin,
  checkEmail,
  checkContactNo,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Validation rules
const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('contactNo').trim().notEmpty().withMessage('Contact number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

// Routes
router.post('/check-email', checkEmail)
router.post('/check-contact', checkContactNo)
router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/admin/login', loginValidation, adminLogin)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/profile', protect, upload.single('photo'), updateProfile)

module.exports = router

