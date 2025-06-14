const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    originalText: {
        type: String,
        required: true
    },
    targetLanguage: {
        type: String,
        required: true
    },
    translatedText: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

translationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Translation', translationSchema);