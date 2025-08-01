const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Registro y Login
router.post('/register', registerUser); // 🔓 TEMPORALMENTE ABIERTO
router.post('/login', loginUser);

// Ruta protegida - Perfil del usuario logueado
router.get('/profile', protect, authorizeRoles('admin'), getUserProfile);

// Obtener todos los usuarios
router.get('/', protect, authorizeRoles('admin'), getAllUsers);

// Actualizar usuario por ID
router.put('/:id', protect, authorizeRoles('admin'), updateUser);

// Eliminar usuario por ID
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);


module.exports = router;
