"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Connexion Supabase sécurisée
const supabase = createClient(
  "https://tslndhfoprmrlrkbunew.supabase.co",
  "sb_publishable_G91tXPIiD3Pm02oP-YyR4A_rCjVfuW_"
);

export default function VaultApp() {
  // États de l'application
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);

  // États du formulaire
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');
  const [salaire, setSalaire] = useState('');
  const [iban, setIban] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    // Ajout visuel dans le tableau (en attendant de le lier à Supabase)
    const newStaff = { id: Date.now(), nom, poste, salaire, iban };
    setStaff([...staff, newStaff]);
    
    // Réinitialisation et fermeture
    setNom('');
    setPoste('');
    setSalaire('');
    setIban('');
    setShowModal(false);
  };

  const handleSEPA = () => {
    alert("Interface SEPA en cours de configuration. Accès restreint.");
  };

  // ------------------------------------------
  // ÉCRAN DE CONNEXION
  // ------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans">
        <div className="mb-12 text-center">
          <h1 className="text-4xl tracking-[0.3em] font-light mb-2">VAULT</h1>
          <p className="text-xs text-gray-500 tracking-widest">BY VELARA</p>
        </div>

        <div className="bg-[#111] p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2 tracking-wider">IDENTIFICATION</label>
              <input 
                type="text" 
                placeholder="Identifiant sécurisé"
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 tracking-wider">CLÉ DE CHIFFREMENT</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-white text-black font-medium py-3 rounded-lg mt-4 hover:bg-gray-200 transition-colors"
            >
              Déchiffrer l'accès
            </button>
          </form>
        </div>

        <div className="mt-16 text-center text-xs text-gray-600 space-y-2">
          <p>SIÈGE SOCIAL : FRANCE</p>
          <p>CONTACT EXCLUSIF : +33 6 17 13 16 43</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // ÉCRAN DU TABLEAU DE BORD
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans relative">
      <header className="flex justify-between items-center mb-16 max-w-6xl mx-auto border-b border-gray-800 pb-8">
        <h1 className="text-2xl tracking-[0.2em] font-light">VAULT</h1>
        <div className="flex items-center gap-2 bg-[#111] border border-green-900/50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-500 text-xs tracking-wider">Réseau Sécurisé</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xs text-gray-500 tracking-widest mb-4">FONDS PROVISIONNÉS</h2>
            <p className="text-6xl font-light">0 €</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="border border-gray-800 hover:border-gray-600 px-6 py-3 rounded-lg text-sm transition-colors"
          >
            + Inscrire au registre
          </button>
        </div>

        <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#111]/50">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 text-xs text-gray-500 tracking-wider">
              <tr>
                <th className="p-6 font-normal">IDENTITÉ</th>
                <th className="p-6 font-normal">FONCTION PRIVÉE</th>
                <th className="p-6 font-normal">RÉMUNÉRATION NETTE</th>
                <th className="p-6 font-normal text-right">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-600 italic">
                    Aucun registre actif.
                  </td>
                </tr>
              ) : (
                staff.map((person) => (
                  <tr key={person.id} className="border-t border-gray-800/30">
                    <td className="p-6">{person.nom}</td>
                    <td className="p-6 text-gray-400">{person.poste}</td>
                    <td className="p-6 font-mono">{person.salaire} €</td>
                    <td className="p-6 text-right text-green-500">Actif</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSEPA}
            className="bg-white text-black px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Autoriser les virements SEPA
          </button>
        </div>
      </main>

      {/* ------------------------------------------ */}
      {/* MODALE D'AJOUT (POP-UP) */}
      {/* ------------------------------------------ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
            <h3 className="text-xl font-light mb-6 tracking-wider">NOUVELLE ENTRÉE</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input 
                type="text" placeholder="Identité complète" required
                value={nom} onChange={(e) => setNom(e.target.value)} 
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 text-white" 
              />
              <input 
                type="text" placeholder="Fonction Privée (ex: Designer)" required
                value={poste} onChange={(e) => setPoste(e.target.value)} 
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 text-white" 
              />
              <input 
                type="number" placeholder="Rémunération Nette (€)" required
                value={salaire} onChange={(e) => setSalaire(e.target.value)} 
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 text-white" 
              />
              <input 
                type="text" placeholder="IBAN Bancaire" required
                value={iban} onChange={(e) => setIban(e.target.value)} 
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 text-white" 
              />
              
              <div className="flex gap-4 mt-8 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-transparent border border-gray-800 text-white py-3 rounded-lg text-sm hover:bg-gray-900 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-white text-black py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}