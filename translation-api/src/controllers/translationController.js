const { v4: uuidv4 } = require('uuid');
const Translation = require('../models/Translation');
const { sendToQueue } = require('../config/rabbitmq');

exports.createTranslation = async (req, res) => {
    const { originalText, targetLanguage } = req.body;

    if (!originalText || !targetLanguage) {
        return res.status(400).json({ message: 'originalText and targetLanguage are required.' });
    }

    const requestId = uuidv4();

    try {
        const newTranslation = new Translation({
            requestId,
            originalText,
            targetLanguage,
            status: 'queued'
        });
        await newTranslation.save();

        const messageSent = await sendToQueue({ requestId, originalText, targetLanguage });

        if (!messageSent) {
            // Se a mensagem não puder ser enviada para a fila, marcar como falha
            newTranslation.status = 'failed';
            await newTranslation.save();
            return res.status(500).json({ message: 'Failed to queue translation request.', requestId });
        }

        res.status(202).json({
            message: 'Translation request received and queued.',
            requestId
        });
    } catch (error) {
        console.error('Error creating translation request:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getTranslationStatus = async (req, res) => {
    const { requestId } = req.params;

    try {
        const translation = await Translation.findOne({ requestId });

        if (!translation) {
            return res.status(404).json({ message: 'Translation request not found.' });
        }

        res.status(200).json({
            requestId: translation.requestId,
            status: translation.status,
            originalText: translation.originalText,
            targetLanguage: translation.targetLanguage,
            translatedText: translation.translatedText,
            createdAt: translation.createdAt,
            updatedAt: translation.updatedAt
        });
    } catch (error) {
        console.error('Error getting translation status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};