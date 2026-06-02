"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Connexion Supabase
const supabase = createClient(
  "https://tslndhfoprmrlrkbunew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbG5kaGZvcHJtcmxya2J1bmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjQ3NzcsImV4cCI6MjA5NTkwMDc3N30.t3ash-DaNnKQdtDhD6t9XkyZ4eiJ2y-2-i5jklvDbN8"
);

export default function VaultApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  
  // UX : État de chargement pour les Skeletons
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);
  
  // États d'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');

  // Mode Confidentialité
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  // États pour la fenêtre modale d'ajout
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newEmailEmploye, setNewEmailEmploye] = useState('');
  const [newPoste, setNewPoste] = useState('');
  const [newSalaire, setNewSalaire] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour le chargement du paiement SEPA
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 1. PERSISTANCE DE LA SESSION
  useEffect(() => {
    setIsMounted(true);
    const storedLogin = localStorage.getItem('velara_logged_in');
    const storedCompany = localStorage.getItem('velara_company_id');
    
    if (storedLogin === 'true' && storedCompany) {
      setIsLoggedIn(true);
      setCompanyId(storedCompany);
      setShowLanding(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('velara_logged_in', 'true');
      localStorage.setItem('velara_company_id', companyId);
    } else {
      localStorage.removeItem('velara_logged_in');
      localStorage.removeItem('velara_company_id');
    }
  }, [isLoggedIn, companyId]);

  // 2. CHARGEMENT DU REGISTRE AVEC SKELETON UX
  const fetchStaff = async () => {
    setIsFetchingStaff(true); // Lance l'animation de chargement
    
    let query = supabase.from('registre').select('*');

    if (companyId !== "admin_global") {
      query = query.eq('entreprise_id', companyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    // Léger délai simulé pour afficher l'UX de chargement
    setTimeout(() => {
      if (data) setStaff(data);
      setIsFetchingStaff(false); // Coupe l'animation
    }, 600);
  };

  useEffect(() => {
    if (isLoggedIn && companyId) fetchStaff();
  }, [isLoggedIn, companyId]);

  const totalFunds = staff.reduce((total, person) => total + (Number(person.salaire) || 0), 0);

  // 3. AUTHENTIFICATION PORTAIL SECURISE
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email.toLowerCase().trim();

    if (userEmail === "boss@velara.com" && password === "Velara2026!") {
      setCompanyId("admin_global");
      setIsLoggedIn(true);
      return;
    }

    try {
      const { data: entreprise, error } = await supabase
        .from('entreprises')
        .select('*')
        .eq('email_contact', userEmail)
        .eq('mot_de_passe', password)
        .single();

      if (entreprise) {
        setCompanyId(entreprise.id);
        setIsLoggedIn(true);
      } else {
        alert("Accès refusé. Identification ou clé incorrecte.");
        setPassword('');
      }
    } catch (err) {
      alert("Erreur lors de l'authentification sécurisée.");
      setPassword('');
    }
  };

  // 4. ARCHITECTURE AUTOMATISÉE : ENREGISTREMENT ET INVITATION
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedEmail = newEmailEmploye.toLowerCase().trim();

    try {
      const { data, error } = await supabase
        .from('registre')
        .insert([{ nom: newNom, email_employe: formattedEmail, poste: newPoste, salaire: Number(newSalaire), entreprise_id: companyId }])
        .select();

      if (error) {
        alert("Erreur lors de l'enregistrement DB : " + error.message);
      } else if (data) {
        try {
          await fetch('/api/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: newNom, email_employe: formattedEmail, poste: newPoste, entreprise_id: companyId })
          });
        } catch (apiErr) {
          console.error("Erreur API Invitation :", apiErr);
        }

        setStaff([data[0], ...staff]);
        setIsAddModalOpen(false);
        setNewNom('');
        setNewEmailEmploye('');
        setNewPoste('');
        setNewSalaire('');
      }
    } catch (err) {
      alert("Erreur système.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. GESTIONNAIRE DE PAIEMENT
  const handleSEPA = async () => {
    if (totalFunds === 0) return alert("Aucun fonds à provisionner.");
    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: companyId, totalAmount: totalFunds })
      });
      const data = await response.json();
      if (data.success) alert("✅ DEPLOIEMENT REUSSI :\n" + data.message + "\n\nID Transaction : " + data.transactionId);
      else alert("❌ TRANSIT ECHOUE : " + data.error);
    } catch (err) {
      alert("Erreur de passerelle bancaire.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleVIPRequest = () => {
    const isMobile = /iPhone|Android|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = "tel:+33617131643";
    else alert("Veuillez appeler le 06 17 13 16 43 pour obtenir une accréditation.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCompanyId('');
    setEmail('');
    setPassword('');
    setShowLanding(true);
  };

  if (!isMounted) return null;

  // ------------------------------------------
  // INTERFACE 1 : LA VITRINE PRINCIPALE
  // ------------------------------------------
  if (showLanding && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-gray-800 flex flex-col">
        <header className="flex justify-between items-center p-8 max-w-7xl mx-auto w-full relative z-10">
          <h1 className="text-xl tracking-[0.3em] font-light">VELARA</h1>
          <button onClick={() => setShowLanding(false)} className="text-xs text-gray-400 hover:text-white tracking-widest transition-colors border border-gray-800 hover:border-gray-600 px-6 py-2 rounded-full">ACCÈS PRIVÉ</button>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-10vh]">
          <div className="inline-block border border-gray-800 text-gray-400 text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full mb-8">INFRASTRUCTURE DE GESTION</div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tight mb-8 max-w-4xl">L'excellence financière, <br/><span className="text-gray-500">sans le bruit.</span></h2>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed mb-12 font-light">Velara déploie des architectures de paiement et des registres privés pour les entités exigeantes.</p>
          <button onClick={handleVIPRequest} className="bg-white text-black px-8 py-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors tracking-wide">Demander une accréditation</button>
        </main>
      </div>
    );
  }

  // ------------------------------------------
  // INTERFACE 2 : ACCÈS AUTHENTIFICATION
  // ------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans relative">
        <button onClick={() => setShowLanding(true)} className="absolute top-8 left-8 text-xs text-gray-500 hover:text-white tracking-widest transition-colors">← RETOUR À LA VITRINE</button>
        <div className="mb-12 text-center">
          <h1 className="text-4xl tracking-[0.3em] font-light mb-2">VAULT</h1>
          <p className="text-xs text-gray-500 tracking-widest">BY VELARA</p>
        </div>
        <div className="bg-[#111] p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs text-gray-500 mb-2 tracking-wider">IDENTIFICATION</label>
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 tracking-wider">CLÉ DE CHIFFREMENT</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white" />
            </div>
            <button type="submit" className="w-full bg-white text-black font-medium py-3 rounded-lg mt-4 hover:bg-gray-200 transition-colors">Déchiffrer l'accès</button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // INTERFACE 3 : COFFRE-FORT (DASHBOARD)
  // ------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans relative print:bg-white print:text-black print:p-0">
      
      {/* ANIMATIONS CSS PURES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* MODALE AVEC ANIMATIONS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden animate-fade-in">
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg tracking-widest font-light">NOUVEAU MEMBRE</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2 tracking-wider">IDENTITÉ COMPLÈTE</label>
                <input type="text" required value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Ex: Jean Dupont" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 tracking-wider">EMAIL DE CONTACT</label>
                <input type="email" required value={newEmailEmploye} onChange={(e) => setNewEmailEmploye(e.target.value)} placeholder="Ex: jean@entreprise.com" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 tracking-wider">FONCTION ATTRIBUÉE</label>
                <input type="text" required value={newPoste} onChange={(e) => setNewPoste(e.target.value)} placeholder="Ex: Directeur Artistique" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 tracking-wider">RÉMUNÉRATION NETTE (€)</label>
                <input type="number" required value={newSalaire} onChange={(e) => setNewSalaire(e.target.value)} placeholder="Ex: 4500" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gray-600 transition-colors text-white placeholder-gray-700" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-medium py-3 rounded-lg mt-8 hover:bg-gray-200 transition-colors disabled:opacity-50">
                {isSubmitting ? "Chiffrement en cours..." : "Inscrire au registre"}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 max-w-6xl mx-auto border-b border-gray-800 pb-8 print:border-b-gray-300">
        <div>
          <h1 className="text-2xl tracking-[0.2em] font-light">VAULT</h1>
          <p className="text-[9px] text-gray-600 tracking-widest mt-1 uppercase print:text-gray-500">ID ENTITÉ : {companyId}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 md:gap-6 print:hidden">
            <button onClick={() => setIsAddModalOpen(true)} className="text-[11px] text-white tracking-widest font-medium bg-[#161616] border border-gray-700 px-5 py-2.5 rounded-full hover:bg-[#222] hover:border-gray-500 transition-all shadow-inner">
              + NOUVEAU MEMBRE
            </button>
            <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="text-xs text-gray-400 hover:text-white transition-colors tracking-widest">
              {isPrivacyMode ? "👁️ RÉVÉLER" : "👁️‍🗨️ MASQUER"}
            </button>
            
            {/* BOUTON EXPORT PDF RESTAURÉ */}
            <button onClick={() => window.print()} className="text-xs text-gray-400 hover:text-white transition-colors tracking-widest border border-gray-800 px-4 py-2 rounded-full hover:border-gray-600">
              📄 EXPORT PDF
            </button>

            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400 transition-colors tracking-widest">
              DÉCONNEXION
            </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-16">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xs text-gray-500 tracking-widest mb-4">FONDS PROVISIONNÉS</h2>
            <p className="text-6xl font-light">
              {isPrivacyMode ? "••••••" : totalFunds.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs text-gray-500 tracking-widest font-medium print:text-black">REGISTRE DES MEMBRES ACTIFS</h2>
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#111]/50 print:border-gray-300 print:bg-white">
            <table className="w-full text-left text-sm print:text-black">
              <thead className="border-b border-gray-800 text-xs text-gray-500 tracking-wider bg-black/20 print:bg-gray-100 print:border-gray-300">
                <tr>
                  <th className="p-6 font-normal">IDENTITÉ</th>
                  <th className="p-6 font-normal">FONCTION CONFIRMÉE</th>
                  <th className="p-6 font-normal">RÉMUNÉRATION NETTE</th>
                  <th className="p-6 font-normal text-right">STATUT BANCAIRE</th>
                </tr>
              </thead>
              <tbody>
                
                {/* GESTION DES SKELETONS LORS DU CHARGEMENT */}
                {isFetchingStaff ? (
                  [1, 2, 3].map((skeleton) => (
                    <tr key={`skeleton-${skeleton}`} className="border-t border-gray-800/20">
                      <td className="p-6">
                        <div className="h-4 w-32 bg-gray-800/50 rounded mb-2 animate-pulse"></div>
                        <div className="h-2 w-48 bg-gray-900/50 rounded animate-pulse"></div>
                      </td>
                      <td className="p-6">
                        <div className="h-4 w-24 bg-gray-800/50 rounded animate-pulse"></div>
                      </td>
                      <td className="p-6">
                        <div className="h-4 w-16 bg-gray-800/50 rounded animate-pulse"></div>
                      </td>
                      <td className="p-6 text-right flex justify-end">
                        <div className="h-3 w-32 bg-gray-800/30 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-600 italic">
                      Aucun membre n'est actuellement provisionné.
                    </td>
                  </tr>
                ) : (
                  // AFFICHAGE RÉEL DES DONNÉES
                  staff.map((person) => (
                    <tr key={person.id} className="border-t border-gray-800/30 hover:bg-white/[0.01] transition-colors print:border-gray-200">
                      <td className="p-6">
                        <div className="font-medium">
                          {person.nom}
                          {/* BADGE ADMINISTRATEUR RESTAURÉ */}
                          {companyId === "admin_global" && (
                            <span className="text-[9px] text-gray-600 ml-2 border border-gray-800 px-1.5 py-0.5 rounded uppercase print:hidden">
                              {person.entreprise_id}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 tracking-wider">{person.email_employe || "Aucun email"}</div>
                      </td>
                      <td className="p-6 text-gray-400">{person.poste}</td>
                      <td className="p-6 font-mono text-white print:text-black">
                        {isPrivacyMode ? "•••• €" : `${person.salaire} €`}
                      </td>
                      <td className="p-6 text-right text-orange-400/80 tracking-wider text-[10px] font-medium print:text-orange-700">
                        ⏳ EN ATTENTE D'ONBOARDING
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-4 print:hidden">
          <button onClick={handleSEPA} disabled={isProcessingPayment || isFetchingStaff} className="bg-white text-black px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isProcessingPayment ? <span className="animate-pulse">Analyse financière...</span> : "Autoriser les virements SEPA"}
          </button>
        </div>
      </main>
    </div>
  );
}