import { useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Package,
    ShoppingCart,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Plus,
    Edit,
    Trash2,
    LogOut,
    Menu,
    X,
    TrendingUp,
    TrendingDown,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardResponsable() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [articles, setArticles] = useState([]);
    const [demandes, setDemandes] = useState([]);
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [articleForm, setArticleForm] = useState({
        code: '', nom: '', description: '', quantite: 0, seuil_min: 0, categorie: ''
    });
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const { user, logout } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [articlesRes, demandesRes] = await Promise.all([
                api.get('/articles'),
                api.get('/demandes')
            ]);
            setArticles(articlesRes.data);
            setDemandes(demandesRes.data);
        } catch (err) {
            toast.error('Erreur chargement');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveArticle = async () => {
        try {
            if (editingArticle) {
                await api.put(`/articles/${editingArticle._id}`, articleForm);
                toast.success('Article modifié');
            } else {
                await api.post('/articles', articleForm);
                toast.success('Article ajouté');
            }
            setShowArticleModal(false);
            setEditingArticle(null);
            setArticleForm({ code: '', nom: '', description: '', quantite: 0, seuil_min: 0, categorie: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDeleteArticle = async (id) => {
        if (window.confirm('Supprimer cet article ?')) {
            await api.delete(`/articles/${id}`);
            toast.success('Supprimé');
            fetchData();
        }
    };

    const handleTraiterDemande = async (id, action, motif = null) => {
        try {
            await api.put(`/demandes/${id}/traiter`, { action, motif_rejet: motif });
            toast.success(`Demande ${action === 'acceptee' ? 'acceptée' : 'rejetée'}`);
            fetchData();
            setSelectedDemande(null);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const stats = {
        totalArticles: articles.length,
        pendingDemandes: demandes.filter(d => d.statut === 'en_attente').length,
        accepted: demandes.filter(d => d.statut === 'acceptee').length,
        rejected: demandes.filter(d => d.statut === 'rejetee').length,
        critical: articles.filter(a => a.quantite <= a.seuil_min).length
    };

    // Données pour graphiques
    const statusData = [
        { name: 'En attente', value: stats.pendingDemandes, color: '#FF7043' },
        { name: 'Acceptées', value: stats.accepted, color: '#10B981' },
        { name: 'Rejetées', value: stats.rejected, color: '#EF4444' }
    ];

    const topArticles = [...articles].sort((a, b) => b.quantite - a.quantite).slice(0, 5);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
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
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-colors ${activeTab === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        <Package size={20} />
                        <span className={`${!sidebarOpen && 'hidden'}`}>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-colors ${activeTab === 'stock' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        <ShoppingCart size={20} />
                        <span className={`${!sidebarOpen && 'hidden'}`}>Gestion stock</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('demandes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-colors ${activeTab === 'demandes' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        <Eye size={20} />
                        <span className={`${!sidebarOpen && 'hidden'}`}>Demandes</span>
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
                {/* Header */}
                <div className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {activeTab === 'dashboard' && 'Tableau de bord'}
                        {activeTab === 'stock' && 'Gestion du stock'}
                        {activeTab === 'demandes' && 'Gestion des demandes'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600">👋 {user?.nom}</span>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'dashboard' && (
                        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                                {[
                                    { icon: Package, label: 'Articles', value: stats.totalArticles, color: 'bg-blue-500' },
                                    { icon: ShoppingCart, label: 'En attente', value: stats.pendingDemandes, color: 'bg-orange-500' },
                                    { icon: CheckCircle, label: 'Acceptées', value: stats.accepted, color: 'bg-green-500' },
                                    { icon: XCircle, label: 'Rejetées', value: stats.rejected, color: 'bg-red-500' },
                                    { icon: AlertTriangle, label: 'Stock critique', value: stats.critical, color: 'bg-encgo-red' }
                                ].map((stat, idx) => (
                                    <motion.div key={idx} variants={cardVariants} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-500 text-sm">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                            </div>
                                            <div className={`${stat.color} p-3 rounded-full text-white`}>
                                                <stat.icon size={24} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-md p-4">
                                    <h3 className="text-lg font-semibold mb-4">Répartition des demandes</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white rounded-xl shadow-md p-4">
                                    <h3 className="text-lg font-semibold mb-4">Top 5 articles (stock)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topArticles}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="quantite" fill="#E53935" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Alertes stock critique */}
                            {stats.critical > 0 && (
                                <div className="bg-red-50 border-l-4 border-encgo-red rounded-lg p-4">
                                    <h3 className="font-semibold text-encgo-red flex items-center gap-2"><AlertTriangle size={18} /> Stock critique</h3>
                                    <ul className="mt-2 space-y-1">
                                        {articles.filter(a => a.quantite <= a.seuil_min).map(a => (
                                            <li key={a._id} className="text-sm text-gray-700">• {a.nom} : {a.quantite} restants (seuil {a.seuil_min})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'stock' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Liste des articles</h2>
                                <button
                                    onClick={() => {
                                        setEditingArticle(null);
                                        setArticleForm({ code: '', nom: '', description: '', quantite: 0, seuil_min: 0, categorie: '' });
                                        setShowArticleModal(true);
                                    }}
                                    className="bg-encgo-red hover:bg-encgo-red-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                >
                                    <Plus size={18} /> Ajouter
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Code</th><th>Nom</th><th>Description</th><th>Quantité</th><th>Seuil</th><th>Catégorie</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articles.map(a => (
                                            <tr key={a._id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{a.code}</td>
                                                <td>{a.nom}</td>
                                                <td>{a.description}</td>
                                                <td className={a.quantite <= a.seuil_min ? 'text-encgo-red font-bold' : ''}>{a.quantite}</td>
                                                <td>{a.seuil_min}</td>
                                                <td>{a.categorie}</td>
                                                <td className="flex gap-2">
                                                    <button onClick={() => { setEditingArticle(a); setArticleForm(a); setShowArticleModal(true); }} className="text-blue-600"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteArticle(a._id)} className="text-red-600"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'demandes' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-6">Toutes les demandes</h2>
                            <div className="space-y-4">
                                {demandes.map(d => (
                                    <div key={d._id} className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
                                        <div>
                                            <p className="font-semibold">{d.utilisateur_id?.nom} - {d.service}</p>
                                            <p className="text-sm text-gray-500">{d.motif_demande.substring(0, 80)}</p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${d.statut === 'en_attente' ? 'bg-orange-100 text-orange-700' : d.statut === 'acceptee' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {d.statut === 'en_attente' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Rejetée'}
                                            </span>
                                        </div>
                                        {d.statut === 'en_attente' && (
                                            <button
                                                onClick={() => setSelectedDemande(d)}
                                                className="bg-encgo-red hover:bg-encgo-red-dark text-white px-4 py-2 rounded-lg transition"
                                            >
                                                Traiter
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Article amélioré */}
            <AnimatePresence>
                {showArticleModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">{editingArticle ? 'Modifier' : 'Ajouter'} un article</h3>
                            <input type="text" placeholder="Code" className="w-full border rounded-lg p-2 mb-2" value={articleForm.code} onChange={e => setArticleForm({ ...articleForm, code: e.target.value })} />
                            <input type="text" placeholder="Nom" className="w-full border rounded-lg p-2 mb-2" value={articleForm.nom} onChange={e => setArticleForm({ ...articleForm, nom: e.target.value })} />
                            <textarea placeholder="Description" className="w-full border rounded-lg p-2 mb-2" value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} />
                            <input type="number" placeholder="Quantité" className="w-full border rounded-lg p-2 mb-2" value={articleForm.quantite} onChange={e => setArticleForm({ ...articleForm, quantite: parseInt(e.target.value) })} />
                            <input type="number" placeholder="Seuil min" className="w-full border rounded-lg p-2 mb-2" value={articleForm.seuil_min} onChange={e => setArticleForm({ ...articleForm, seuil_min: parseInt(e.target.value) })} />
                            <input type="text" placeholder="Catégorie" className="w-full border rounded-lg p-2 mb-4" value={articleForm.categorie} onChange={e => setArticleForm({ ...articleForm, categorie: e.target.value })} />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowArticleModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Annuler</button>
                                <button onClick={handleSaveArticle} className="px-4 py-2 bg-encgo-red text-white rounded-lg">Enregistrer</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Traitement Demande améliorée */}
            <AnimatePresence>
                {selectedDemande && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl p-6 w-full max-w-2xl">
                            <h3 className="text-xl font-bold mb-4">Traiter la demande</h3>
                            <div className="space-y-2">
                                <p><strong>Demandeur:</strong> {selectedDemande.utilisateur_id?.nom}</p>
                                <p><strong>Service:</strong> {selectedDemande.service}</p>
                                <p><strong>Motif:</strong> {selectedDemande.motif_demande}</p>
                                <div className="mt-3">
                                    <h4 className="font-semibold">Articles :</h4>
                                    <ul className="list-disc pl-5">
                                        {selectedDemande.lignes?.map(l => (
                                            <li key={l._id}>{l.article_id?.nom} - {l.quantite_demandee} (stock: {l.article_id?.quantite})</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setSelectedDemande(null)} className="px-4 py-2 bg-gray-300 rounded-lg">Annuler</button>
                                <button
                                    onClick={() => {
                                        const motif = window.prompt('Motif de rejet :');
                                        if (motif) handleTraiterDemande(selectedDemande._id, 'rejetee', motif);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                >
                                    Rejeter
                                </button>
                                <button onClick={() => handleTraiterDemande(selectedDemande._id, 'acceptee')} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                                    Accepter
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}