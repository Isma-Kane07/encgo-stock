require('dotenv').config({ path: './.env' });
console.log('MONGO_URI:', process.env.MONGO_URI);
const connectDB = require('./config/db');
const User = require('./models/User');
const Article = require('./models/Article');

const seed = async () => {
    await connectDB();
    await User.deleteMany({});
    await Article.deleteMany({});
    
    await User.create([
        { nom: 'Admin ENCGO', email: 'admin@encgo.ma', password: 'admin123', role: 'responsable' },
        { nom: 'Mohammed Amine', email: 'user@encgo.ma', password: 'user123', role: 'fonctionnaire' },
        { nom: 'Meryem Chaabi', email: 'meryem@encgo.ma', password: 'user123', role: 'fonctionnaire' }
    ]);
    
    await Article.create([
        { code: 'PAP-A4-001', nom: 'Papier A4', description: 'Ramette 500 feuilles', quantite: 50, seuil_min: 10, categorie: 'Fournitures' },
        { code: 'STY-BIC-002', nom: 'Stylo Bic bleu', description: 'Boîte de 50', quantite: 200, seuil_min: 30, categorie: 'Fournitures' },
        { code: 'TON-IMPR-003', nom: 'Toner HP', description: 'Cartouche toner', quantite: 8, seuil_min: 2, categorie: 'Informatique' },
        { code: 'CAF-001', nom: 'Café', description: 'Paquet 500g', quantite: 15, seuil_min: 5, categorie: 'Cafétéria' }
    ]);
    
    console.log('✅ Base de données initialisée');
    process.exit(0);
};

seed();