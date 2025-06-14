const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const RABBITMQ_QUEUE_NAME = process.env.RABBITMQ_QUEUE_NAME || 'translation_requests';

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(RABBITMQ_QUEUE_NAME, { durable: true });
        console.log('Worker conectado ao RabbitMQ e escutando a fila:', RABBITMQ_QUEUE_NAME);
        return channel;
    } catch (error) {
        console.error('Worker: Erro ao conectar ao RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); 
        return null;
    }
};

module.exports = {
    connectRabbitMQ,
    RABBITMQ_QUEUE_NAME
};