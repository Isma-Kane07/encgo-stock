const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    description: { type: String, required: true },
    quantite: { type: Number, required: true, min: 0 },
    seuil_min: { type: Number, required: true, min: 0 },
    categorie: { type: String, default: 'Général' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);