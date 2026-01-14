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
  getAllUsers,
  getUserById,
  updateMemberNumber,
  updateUserRole,
  updateMembershipStatus,
  deleteUser,
  notifyUser,
} = require('../controllers/authController')
const { protect, restrictToAdmin } = require('../middleware/auth')
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
// Accept photo and aadhar uploads during registration
// NOTE: run multer upload BEFORE validation so express-validator can see parsed
// text fields from multipart/form-data (multer populates req.body).
router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
]), registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/admin/login', loginValidation, adminLogin)
router.get('/me', protect, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/profile', protect, upload.single('photo'), updateProfile)

// Admin routes for user management
router.get('/users', protect, restrictToAdmin, getAllUsers)
router.get('/users/:id', protect, restrictToAdmin, getUserById)
router.put('/users/:id/membership', protect, restrictToAdmin, updateMembershipStatus)
router.put('/users/:id/role', protect, restrictToAdmin, updateUserRole)
router.put('/users/:id/member-number', protect, restrictToAdmin, updateMemberNumber)
router.delete('/users/:id', protect, restrictToAdmin, deleteUser)
router.post('/users/:id/notify', protect, restrictToAdmin, notifyUser)

module.exports = router

