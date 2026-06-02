"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Connexion Supabase (Utilisée uniquement en LECTURE pour la sécurité)
const supabase = createClient(
  "https://tslndhfoprmrlrkbunew.supabase.co",
  "sb_publishable_G91tXPIiD3Pm02oP-YyR4A_rCjVfuW_"
);

export default function VaultApp() {
  // États de l'application
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  // États pour le verrouillage (Master Key)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Charger les données (On lit ce que tu as configuré dans Supabase)
  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('registre')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setStaff(data);
  };

  useEffect(() => {
    if (isLoggedIn) fetchStaff();
  }, [isLoggedIn]);

  // Fonction de vérification du mot de passe
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Le verrou : Seuls ces identifiants exacts peuvent ouvrir l'application
    if (email === "boss@velara.com" && password === "Velara2026!") {
      setIsLoggedIn(true);
    } else {
      alert("Accès refusé. Identification ou clé incorrecte.");
      setPassword(''); // Efface le mot de passe pour forcer à recommencer
    }
  };

  const handleSEPA = () => {
    alert("Demande d'autorisation SEPA chiffrée. En attente de la passerelle de paiement Stripe.");
  };

  const handleVIPRequest = () => {
    alert("Redirection vers la ligne sécurisée du gestionnaire de compte (+33 6 17 13 16 43)...");
  };

  // ------------------------------------------
  // ÉCRAN DE CONNEXION (SÉCURISÉ)
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
                type="text" required placeholder="Identifiant sécurisé"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 tracking-wider">CLÉ DE CHIFFREMENT</label>
              <input 
                type="password" required placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

        <div className="mt-8 text-center">
            <button 
              onClick={handleVIPRequest} 
              className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest border-b border-transparent hover:border-gray-500 pb-1"
            >
              DEMANDER UNE ACCRÉDITATION VIP
            </button>
        </div>
        
        <div className="mt-16 text-center text-xs text-gray-600 space-y-2">
          <p>SIÈGE SOCIAL : FRANCE</p>
          <p>CONTACT EXCLUSIF : +33 6 17 13 16 43</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // ÉCRAN DU TABLEAU DE BORD (COFFRE-FORT)
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans relative">
      <header className="flex justify-between items-center mb-16 max-w-6xl mx-auto border-b border-gray-800 pb-8">
        <h1 className="text-2xl tracking-[0.2em] font-light">VAULT</h1>
        <div className="flex items-center gap-6">
            <button 
              onClick={handleVIPRequest} 
              className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest"
            >
              CONTACTER LE GESTIONNAIRE
            </button>
            <div className="flex items-center gap-2 bg-[#111] border border-green-900/50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-500 text-xs tracking-wider">Réseau Sécurisé</span>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-16">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xs text-gray-500 tracking-widest mb-4">FONDS PROVISIONNÉS</h2>
            <p className="text-6xl font-light">0 €</p>
          </div>
        </div>

        {/* REGISTRE DES MEMBRES */}
        <div className="space-y-4">
          <h2 className="text-xs text-gray-500 tracking-widest font-medium">REGISTRE DES MEMBRES ACTIFS</h2>
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#111]/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-xs text-gray-500 tracking-wider bg-black/20">
                <tr>
                  <th className="p-6 font-normal">IDENTITÉ</th>
                  <th className="p-6 font-normal">FONCTION CONFIRMÉE</th>
                  <th className="p-6 font-normal">RÉMUNÉRATION NETTE</th>
                  <th className="p-6 font-normal text-right">STATUT BANCAIRE</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-600 italic">
                      Aucun membre n'est actuellement provisionné sur ce registre.
                    </td>
                  </tr>
                ) : (
                  staff.map((person) => (
                    <tr key={person.id} className="border-t border-gray-800/30 hover:bg-white/[0.01] transition-colors">
                      <td className="p-6 font-medium">{person.nom}</td>
                      <td className="p-6 text-gray-400">{person.poste}</td>
                      <td className="p-6 font-mono text-white">{person.salaire} €</td>
                      <td className="p-6 text-right text-green-400 tracking-wider text-xs font-medium">
                        ✓ ACCÈS VALIDE
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSEPA}
            className="bg-white text-black px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Autoriser les virements SEPA
          </button>
        </div>
      </main>
    </div>
  );
}