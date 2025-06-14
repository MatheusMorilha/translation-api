const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const RABBITMQ_QUEUE_NAME = process.env.RABBITMQ_QUEUE_NAME || 'translation_requests';

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(RABBITMQ_QUEUE_NAME, { durable: true });
        console.log('Conectado ao RabbitMQ');
    } catch (error) {
        console.error('Erro ao conectar ao RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Tentar reconectar após 5 segundos
    }
};

const sendToQueue = async (message) => {
    if (!channel) {
        console.error('Canal RabbitMQ não disponível.');
        return false;
    }
    try {
        channel.sendToQueue(RABBITMQ_QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem para a fila:', error);
        return false;
    }
};

module.exports = {
    connectRabbitMQ,
    sendToQueue
};