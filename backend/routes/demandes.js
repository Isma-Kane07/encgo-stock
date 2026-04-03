const express = require('express');
const router = express.Router();
const Demande = require('../models/Demande');
const LigneDemande = require('../models/LigneDemande');
const Article = require('../models/Article');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
    const { service, motif_demande, articles } = req.body;
    for (let item of articles) {
        const article = await Article.findById(item.article_id);
        if (!article) return res.status(404).json({ message: `Article non trouvé` });
        if (article.quantite < item.quantite_demandee) return res.status(400).json({ message: `Stock insuffisant pour ${article.nom}` });
    }
    const demande = new Demande({ utilisateur_id: req.user.id, service, motif_demande });
    await demande.save();
    for (let item of articles) {
        const ligne = new LigneDemande({ demande_id: demande._id, article_id: item.article_id, quantite_demandee: item.quantite_demandee });
        await ligne.save();
    }
    res.status(201).json({ message: 'Demande créée', demande_id: demande._id });
});

router.get('/', authMiddleware, async (req, res) => {
    let demandes;
    if (req.user.role === 'responsable') {
        demandes = await Demande.find().populate('utilisateur_id', 'nom email').populate('traitee_par', 'nom').sort({ date: -1 });
    } else {
        demandes = await Demande.find({ utilisateur_id: req.user.id }).sort({ date: -1 });
    }
    const complet = await Promise.all(demandes.map(async (d) => {
        const lignes = await LigneDemande.find({ demande_id: d._id }).populate('article_id', 'nom code');
        return { ...d.toObject(), lignes };
    }));
    res.json(complet);
});

router.get('/:id', authMiddleware, async (req, res) => {
    const demande = await Demande.findById(req.params.id).populate('utilisateur_id', 'nom email').populate('traitee_par', 'nom');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });
    if (req.user.role !== 'responsable' && demande.utilisateur_id._id.toString() !== req.user.id) return res.status(403).json({ message: 'Accès non autorisé' });
    const lignes = await LigneDemande.find({ demande_id: demande._id }).populate('article_id');
    res.json({ ...demande.toObject(), lignes });
});

router.put('/:id/traiter', authMiddleware, checkRole(['responsable']), async (req, res) => {
    const { action, motif_rejet } = req.body;
    const demande = await Demande.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });
    if (demande.statut !== 'en_attente') return res.status(400).json({ message: 'Déjà traitée' });
    if (action === 'acceptee') {
        const lignes = await LigneDemande.find({ demande_id: demande._id });
        for (let ligne of lignes) {
            const article = await Article.findById(ligne.article_id);
            if (article.quantite < ligne.quantite_demandee) return res.status(400).json({ message: `Stock insuffisant pour ${article.nom}` });
            article.quantite -= ligne.quantite_demandee;
            await article.save();
        }
        demande.statut = 'acceptee';
    } else if (action === 'rejetee') {
        if (!motif_rejet) return res.status(400).json({ message: 'Motif de rejet obligatoire' });
        demande.statut = 'rejetee';
        demande.motif_rejet = motif_rejet;
    } else return res.status(400).json({ message: 'Action invalide' });
    demande.traitee_le = new Date();
    demande.traitee_par = req.user.id;
    await demande.save();
    res.json({ message: `Demande ${action === 'acceptee' ? 'acceptée' : 'rejetée'}` });
});

module.exports = router;