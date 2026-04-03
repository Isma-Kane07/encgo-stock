const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
});

router.get('/:id', authMiddleware, async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });
    res.json(article);
});

router.post('/', authMiddleware, checkRole(['responsable']), async (req, res) => {
    const { code, nom, description, quantite, seuil_min, categorie } = req.body;
    const existing = await Article.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Code article déjà existant' });
    const article = new Article({ code, nom, description, quantite, seuil_min, categorie: categorie || 'Général' });
    await article.save();
    res.status(201).json(article);
});

router.put('/:id', authMiddleware, checkRole(['responsable']), async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });
    const { code, nom, description, quantite, seuil_min, categorie } = req.body;
    article.code = code; article.nom = nom; article.description = description; article.quantite = quantite; article.seuil_min = seuil_min; article.categorie = categorie || article.categorie;
    await article.save();
    res.json(article);
});

router.delete('/:id', authMiddleware, checkRole(['responsable']), async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });
    await article.deleteOne();
    res.json({ message: 'Article supprimé' });
});

module.exports = router;