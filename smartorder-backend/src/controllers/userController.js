const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función para generar el token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Registro
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Este usuario ya existe' });

    const newUser = await User.create({ username, password, role });
    const token = generateToken(newUser);

    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Registro fallido', error });
  }
};

// Login
const loginUser = async (req, res) => {
  console.log('🛂 Body recibido en login:', req.body); // 👈 Agregá esta línea

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Inicio de sesión fallido', error });
  }
};


const getUserProfile = (req, res) => {
    try {
      res.json(req.user); // Ya viene completo desde el middleware
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el perfil' });
    }
  };
  
 // Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
};

// Editar un usuario (solo admin)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (username) user.username = username;
    if (role) user.role = role;

    if (password) {
      user.password = password; // El `pre('save')` ya se encarga de hashearla
    }

    const updatedUser = await user.save();
    res.json({ message: 'Usuario actualizado', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
};

// Eliminar un usuario (solo admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
};


  module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updateUser,
    deleteUser,
  };
