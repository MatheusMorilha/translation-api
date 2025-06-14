const mongoose = require('mongoose');
const { connectRabbitMQ, RABBITMQ_QUEUE_NAME } = require('./config/rabbitmq');
const { processTranslation } = require('./services/translationService');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translation_db';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Worker conectado ao MongoDB'))
    .catch(err => console.error('Worker: Erro ao conectar ao MongoDB:', err));

const startWorker = async () => {
    const channel = await connectRabbitMQ();
    if (channel) {
        channel.consume(RABBITMQ_QUEUE_NAME, async (msg) => {
            if (msg.content) {
                const message = JSON.parse(msg.content.toString());
                console.log('Worker recebeu mensagem:', message);
                await processTranslation(message.requestId, message.originalText, message.targetLanguage);
                channel.ack(msg); 
            }
        }, { noAck: false }); 
    }
};

startWorker();