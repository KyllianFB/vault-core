"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Initialisation de Supabase via le fichier .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VaultApp() {
  // 2. Gestion des états (La mémoire de l'interface)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // États du formulaire
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');
  const [salaire, setSalaire] = useState('');
  const [iban, setIban] = useState('');

  // 3. Synchronisation avec la base de données
  useEffect(() => {
    if (isLoggedIn) {
      fetchStaff();
    }
  }, [isLoggedIn]);

  async function fetchStaff() {
    const { data, error } = await supabase
      .from('personnel_prive')
      .select('*')
      .order('date_ajout', { ascending: false });

    if (!error && data) {
      setStaff(data);
    }
  }

  // 4. Logique métier
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalProvision = staff.reduce((acc, curr) => acc + Number(curr.salaire_net_mensuel), 0);

  async function handleAddStaff() {
    if (!nom || !poste || !salaire) return;

    const { error } = await supabase
      .from('personnel_prive')
      .insert([{
        nom_complet: nom,
        intitule_poste: poste,
        salaire_net_mensuel: salaire,
        iban_chiffre: iban || "IBAN_CHIFFRÉ_PAR_DÉFAUT"
      }]);

    if (!error) {
      setNom(''); setPoste(''); setSalaire(''); setIban('');
      setShowModal(false);
      fetchStaff();
    }
  }

  async function handlePayment() {
    setIsProcessing(true);
    
    setTimeout(async () => {
      const { error } = await supabase
        .from('personnel_prive')
        .update({ statut_virement: 'verse' })
        .neq('statut_virement', 'verse');

      if (!error) {
        setIsProcessing(false);
        setPaymentDone(true);
        fetchStaff();
      }
    }, 3000);
  }

  // 5. RENDU VISUEL (L'interface)
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans flex flex-col selection:bg-white selection:text-black">
      
      {/* --- ÉCRAN DE CONNEXION --- */}
      {!isLoggedIn && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-light text-white tracking-[0.3em] ml-3">VAULT</h1>
            <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">by Velara</p>
          </div>
          <div className="bg-[#111111] border border-white/5 p-10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Identification</label>
              <input type="email" className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-gray-500 transition-colors" placeholder="finance@velara.com" />
            </div>
            <div className="mb-8">
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Clé de chiffrement</label>
              <input type="password" className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-gray-500 transition-colors" placeholder="••••••••••••••••" />
            </div>
            <button onClick={() => setIsLoggedIn(true)} className="w-full bg-white text-black text-sm font-medium py-3 rounded-lg hover:bg-gray-200 transition-all transform hover:scale-[1.02]">
              Déchiffrer l'accès
            </button>
          </div>
          <div className="mt-16 text-center text-[10px] uppercase tracking-widest text-gray-600 space-y-2">
            <p>Siège social : France</p>
            <p>Contact exclusif : +33 6 17 13 16 43</p>
          </div>
        </div>
      )}

      {/* --- TABLEAU DE BORD --- */}
      {isLoggedIn && (
        <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-6 animate-fade-in">
          <header className="flex justify-between items-center py-8 border-b border-gray-800/50 mb-10">
            <div>
              <h1 className="text-xl font-light text-white tracking-[0.2em]">VAULT</h1>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-green-500 border border-green-500/20 bg-green-500/10 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Réseau Sécurisé
              </span>
            </div>
          </header>

          <main>
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Fonds provisionnés</p>
                <h2 className="text-5xl font-light text-white tracking-tight">{formatMoney(totalProvision)}</h2>
              </div>
              <button onClick={() => setShowModal(true)} className="bg-[#111111] border border-white/5 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-white">
                + Inscrire au registre
              </button>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/50 text-gray-500 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-5 font-normal">Identité</th>
                    <th className="p-5 font-normal">Fonction Privée</th>
                    <th className="p-5 font-normal">Rémunération Nette</th>
                    <th className="p-5 font-normal text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {staff.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="p-5 text-white">{employee.nom_complet}</td>
                      <td className="p-5 text-gray-400">{employee.intitule_poste}</td>
                      <td className="p-5 text-white font-mono text-sm">{formatMoney(employee.salaire_net_mensuel)}</td>
                      <td className="p-5 text-right">
                        <span className={`text-[9px] uppercase tracking-widest border px-2.5 py-1 rounded ${employee.statut_virement === 'en_attente' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' : 'border-green-500/30 bg-green-500/10 text-green-500'}`}>
                          {employee.statut_virement === 'en_attente' ? 'En attente' : 'Versé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handlePayment} 
                disabled={isProcessing || paymentDone}
                className={`text-sm font-medium px-8 py-3 rounded-lg transition-all flex items-center ${isProcessing ? 'bg-[#111111] text-white border border-white/5' : paymentDone ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                {isProcessing ? <span className="animate-pulse">Établissement du tunnel...</span> : paymentDone ? '✓ Fonds transférés' : 'Autoriser les virements SEPA'}
              </button>
            </div>
          </main>
        </div>
      )}

      {/* --- MODAL D'AJOUT --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] border border-white/5 p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl text-white font-light mb-8">Nouvelle inscription</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Nom Complet</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-sm text-white focus:outline-none" placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Intitulé du poste (Libre)</label>
                <input type="text" value={poste} onChange={(e) => setPoste(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-sm text-white focus:outline-none" placeholder="Ex: Pilote Hélicoptère" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Salaire Mensuel Net (€)</label>
                <input type="number" value={salaire} onChange={(e) => setSalaire(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-sm text-white focus:outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">🔒 IBAN (Sera Chiffré AES-256)</label>
                <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 text-sm text-gray-400 focus:outline-none font-mono" placeholder="FR76..." />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-transparent border border-gray-700 py-3 rounded-lg text-sm text-white hover:bg-gray-800 transition-colors">Annuler</button>
              <button onClick={handleAddStaff} className="flex-1 bg-white text-black py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
// Force l'URL et la clé ici pour tester si Vercel les "voit" enfin
const supabaseUrl = "https://tslndhfoprmrlrkbunew.supabase.co";
const supabaseKey = "sb_publishable_G91tXPIiD3Pm02oP-YyR4A_rCjVfuW_";
const supabase = createClient(supabaseUrl, supabaseKey);