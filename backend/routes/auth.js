const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { nom, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email déjà utilisé' });
        const user = new User({ nom, email, password, role });
        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, nom: user.nom, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        const isValid = await user.comparePassword(password);
        if (!isValid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        const token = jwt.sign({ id: user._id, role: user.role, nom: user.nom }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, nom: user.nom, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

module.exports = router;