const mongoose = require('mongoose');

const ligneDemandeSchema = new mongoose.Schema({
    demande_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Demande', required: true },
    article_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    quantite_demandee: { type: Number, required: true, min: 1 }
});

module.exports = mongoose.model('LigneDemande', ligneDemandeSchema);