const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conexión a MongoDB
connectDB();

const app = express();

// 💡 CORS PRIMERO
const allowedOrigins = [
  'http://localhost:3000',
  'https://smartorder-frontend.vercel.app',
  'https://smartorder-frontend-jjy7ozmus-smartorders-projects.vercel.app',
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ Bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

// 👉 Middleware de JSON después de CORS
app.use(express.json());

// Rutas
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const mesaRoutes = require('./routes/mesaRoutes');
const orderRoutes = require('./routes/orderRoutes');

// 👉 Manejar preflight requests (OPTIONS)
app.options('*', cors({
  origin: allowedOrigins,
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
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
