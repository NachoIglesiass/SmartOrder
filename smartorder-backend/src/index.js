const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Rutas
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const mesaRoutes = require('./routes/mesaRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Cargar variables de entorno
dotenv.config();

// Conexión a MongoDB
connectDB();

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración CORS (local + producción)
const allowedOrigins = ['http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`Bloqueado por CORS: ${origin}`);
      return callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡SmartOrder backend funcionando correctamente!');
});

// Rutas API
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mesas', mesaRoutes);
app.use('/api/orders', orderRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
