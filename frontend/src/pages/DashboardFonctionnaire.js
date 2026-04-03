import { useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Package, 
  Plus, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Eye, 
  Trash2,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardFonctionnaire() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [demandes, setDemandes] = useState([]);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [demandeForm, setDemandeForm] = useState({
    service: '',
    motif_demande: '',
    articles: [{ article_id: '', quantite_demandee: 1 }]
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchArticles();
    fetchDemandes();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles');
      setAllArticles(res.data);
      setArticles(res.data);
      const cats = [...new Set(res.data.map(a => a.categorie).filter(c => c))];
      setCategories(cats);
    } catch (err) {
      toast.error('Erreur chargement articles');
    }
  };

  const fetchDemandes = async () => {
    try {
      const res = await api.get('/demandes');
      setDemandes(res.data);
    } catch (err) {
      toast.error('Erreur chargement demandes');
    }
  };

  const handleLogout = () => {
  logout();        
  navigate('/login');
};

  useEffect(() => {
    let filtered = allArticles;
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(a => a.categorie === selectedCategory);
    }
    setArticles(filtered);
  }, [searchTerm, selectedCategory, allArticles]);

  const addArticleLine = () => {
    setDemandeForm({
      ...demandeForm,
      articles: [...demandeForm.articles, { article_id: '', quantite_demandee: 1 }]
    });
  };

  const removeArticleLine = (index) => {
    const newArticles = [...demandeForm.articles];
    newArticles.splice(index, 1);
    setDemandeForm({ ...demandeForm, articles: newArticles });
  };

  const updateArticleLine = (index, field, value) => {
    const newArticles = [...demandeForm.articles];
    newArticles[index][field] = field === 'quantite_demandee' ? parseInt(value) : value;
    setDemandeForm({ ...demandeForm, articles: newArticles });
  };

  const handleSubmitDemande = async (e) => {
    e.preventDefault();
    const invalid = demandeForm.articles.some(a => !a.article_id || a.quantite_demandee < 1);
    if (invalid) {
      toast.error('Veuillez remplir toutes les lignes correctement');
      return;
    }
    try {
      await api.post('/demandes', {
        service: demandeForm.service,
        motif_demande: demandeForm.motif_demande,
        articles: demandeForm.articles
      });
      toast.success('Demande envoyée');
      setShowDemandeModal(false);
      setDemandeForm({ service: '', motif_demande: '', articles: [{ article_id: '', quantite_demandee: 1 }] });
      fetchDemandes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const openDetailsModal = (demande) => {
    setSelectedDemande(demande);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-encgo-red shadow-xl z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex justify-between items-center border-b border-white/20">
          <h1 className={`text-white font-bold text-xl transition-opacity ${!sidebarOpen && 'opacity-0 hidden'}`}>ENCGO Stock</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-1 rounded-lg hover:bg-white/20">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-colors ${activeTab === 'articles' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <Package size={20} />
            <span className={`${!sidebarOpen && 'hidden'}`}>Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('demandes')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-colors ${activeTab === 'demandes' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <History size={20} />
            <span className={`${!sidebarOpen && 'hidden'}`}>Mes demandes</span>
          </button>
        </nav>
        <div className="absolute bottom-4 w-full px-4">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition">
                                <LogOut size={20} />
                                <span className={`${!sidebarOpen && 'hidden'}`}>Déconnexion</span>
                            </button>
                            <div className={`text-center text-white/60 text-xs mt-3 transition-opacity ${!sidebarOpen && 'opacity-0'}`}>
                                © ENCGO {new Date().getFullYear()} - Tous droits réservés.
                            </div>
                        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === 'articles' ? 'Articles disponibles' : 'Mes demandes'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">👋 {user?.nom}</span>
            {activeTab === 'articles' && (
              <button
                onClick={() => setShowDemandeModal(true)}
                className="bg-encgo-red hover:bg-encgo-red-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={18} /> Nouvelle demande
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'articles' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Filtres */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou code..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-encgo-red"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-encgo-red"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {/* Tableau */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr><th className="p-3 text-left">Code</th><th>Nom</th><th>Description</th><th>Quantité</th><th>Catégorie</th></tr>
                  </thead>
                  <tbody>
                    {articles.map(a => (
                      <tr key={a._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{a.code}</td>
                        <td>{a.nom}</td>
                        <td>{a.description}</td>
                        <td className={a.quantite <= a.seuil_min ? 'text-encgo-red font-bold' : ''}>{a.quantite}</td>
                        <td>{a.categorie}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'demandes' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Historique de mes demandes</h2>
              <div className="space-y-4">
                {demandes.map(d => (
                  <div key={d._id} className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <p className="font-semibold">Demande du {new Date(d.date).toLocaleDateString()} - Service: {d.service}</p>
                      <p className="text-sm text-gray-500">{d.motif_demande.substring(0, 80)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${d.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : d.statut === 'acceptee' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {d.statut === 'en_attente' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Rejetée'}
                      </span>
                    </div>
                    <button onClick={() => openDetailsModal(d)} className="text-encgo-red hover:text-encgo-red-dark p-2">
                      <Eye size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle demande améliorée */}
      <AnimatePresence>
        {showDemandeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Nouvelle demande</h3>
              <form onSubmit={handleSubmitDemande}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Service *</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={demandeForm.service} onChange={e => setDemandeForm({...demandeForm, service: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Motif *</label>
                  <textarea className="w-full border rounded-lg p-2" rows="2" value={demandeForm.motif_demande} onChange={e => setDemandeForm({...demandeForm, motif_demande: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Articles *</label>
                  {demandeForm.articles.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <select className="flex-1 border rounded-lg p-2" value={item.article_id} onChange={e => updateArticleLine(idx, 'article_id', e.target.value)} required>
                        <option value="">Sélectionner</option>
                        {allArticles.map(art => <option key={art._id} value={art._id}>{art.code} - {art.nom} (stock: {art.quantite})</option>)}
                      </select>
                      <input type="number" min="1" className="w-24 border rounded-lg p-2" placeholder="Qté" value={item.quantite_demandee} onChange={e => updateArticleLine(idx, 'quantite_demandee', e.target.value)} required />
                      {demandeForm.articles.length > 1 && <button type="button" onClick={() => removeArticleLine(idx)} className="text-red-500"><Trash2 size={20} /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addArticleLine} className="text-encgo-red text-sm flex items-center gap-1 mt-1"><Plus size={16} /> Ajouter un article</button>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowDemandeModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-encgo-red text-white rounded-lg">Envoyer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détails demande */}
      <AnimatePresence>
        {showDetailsModal && selectedDemande && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Détails de la demande</h3>
              <div className="space-y-2">
                <p><strong>Date :</strong> {new Date(selectedDemande.date).toLocaleString()}</p>
                <p><strong>Service :</strong> {selectedDemande.service}</p>
                <p><strong>Motif :</strong> {selectedDemande.motif_demande}</p>
                <p><strong>Statut :</strong> <span className={`inline-block px-2 py-1 text-xs rounded-full ${selectedDemande.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : selectedDemande.statut === 'acceptee' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedDemande.statut}</span></p>
                {selectedDemande.motif_rejet && <p><strong>Motif de rejet :</strong> {selectedDemande.motif_rejet}</p>}
                <div className="mt-3">
                  <h4 className="font-semibold">Articles :</h4>
                  <ul className="list-disc pl-5">
                    {selectedDemande.lignes?.map(l => <li key={l._id}>{l.article_id?.nom} - {l.quantite_demandee}</li>)}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-encgo-red text-white rounded-lg">Fermer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
