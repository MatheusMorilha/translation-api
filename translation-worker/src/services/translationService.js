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

const TranslationModel = mongoose.model('Translation', translationSchema);



const mockTranslate = async (text, targetLanguage) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const translations = {
                'en': {
                    'olá': 'hello',
                    'mundo': 'world',
                    'programação': 'programming',
                    'teste': 'test',
                    'casa': 'house'
                },
                'es': {
                    'olá': 'hola',
                    'mundo': 'mundo',
                    'programação': 'programación',
                    'teste': 'prueba',
                    'casa': 'casa'
                },
                'fr': {
                    'olá': 'bonjour',
                    'mundo': 'monde',
                    'programação': 'programmation',
                    'teste': 'test',
                    'casa': 'maison'
                }
            };

            const translated = text.split(' ').map(word => {
                const lowerCaseWord = word.toLowerCase();
                return translations[targetLanguage]?.[lowerCaseWord] || word;
            }).join(' ');

            resolve(translated);
        }, Math.random() * 3000 + 1000); 
    });
};

exports.processTranslation = async (requestId, originalText, targetLanguage) => {
    try {
        const translation = await TranslationModel.findOne({ requestId });

        if (!translation) {
            console.error(`Translation with requestId ${requestId} not found.`);
            return;
        }

        
        translation.status = 'processing';
        await translation.save();
        console.log(`Requisição ${requestId} marcada como 'processing'.`);

        const translatedText = await mockTranslate(originalText, targetLanguage);


        translation.translatedText = translatedText;
        translation.status = 'completed';
        await translation.save();
        console.log(`Requisição ${requestId} concluída: '${originalText}' -> '${translatedText}'`);

    } catch (error) {
        console.error(`Erro ao processar a requisição ${requestId}:`, error);

        const translation = await TranslationModel.findOne({ requestId });
        if (translation) {
            translation.status = 'failed';
            await translation.save();
        }
    }
};