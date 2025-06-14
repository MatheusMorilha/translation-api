const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const translationRoutes = require('./routes/translationRoutes');
const { connectRabbitMQ } = require('./config/rabbitmq');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translation_db';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// RabbitMQ connection
connectRabbitMQ();

// Routes
app.use('/api', translationRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Translation API is running.' });
});

module.exports = app;