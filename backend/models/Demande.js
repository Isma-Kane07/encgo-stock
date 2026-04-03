const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
    utilisateur_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    statut: { type: String, enum: ['en_attente', 'acceptee', 'rejetee'], default: 'en_attente' },
    motif_rejet: { type: String, default: null },
    service: { type: String, required: true },
    motif_demande: { type: String, required: true },
    traitee_le: Date,
    traitee_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Demande', demandeSchema);