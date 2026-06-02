import { NextResponse } from 'next/server';
// @ts-ignore (Empêche Next.js de bloquer le build si le package n'est pas encore installé)
import Stripe from 'stripe';

// ==========================================
// 🎛️ L'INTERRUPTEUR MAÎTRE (Seul truc à changer dans le code)
// ==========================================
const INTEGRATION_STRIPE_REELLE = false; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, totalAmount } = body;

    // --- MODE 1 : SIMULATION (Actif par défaut) ---
    if (!INTEGRATION_STRIPE_REELLE) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Délai réseau
      return NextResponse.json({
        success: true,
        message: `Transfert de ${totalAmount} € autorisé pour l'entité ${companyId} (Mode Simulation).`,
        transactionId: "sim_tx_" + Math.random().toString(36).substring(7)
      });
    }

    // --- MODE 2 : PRODUCTION RÉELLE (S'active via l'interrupteur) ---
    // Initialisation sécurisée du SDK Stripe avec ta clé secrète cachée
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16', // Version stable de l'API Stripe
    });

    // Création d'un ordre de paiement réel en Direct Debit SEPA
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe calcule tout en centimes (ex: 100€ = 10000)
      currency: 'eur',
      payment_method_types: ['sepa_debit'],
      metadata: {
        entreprise_id: companyId,
        systeme: "Velara Vault Core"
      }
    });

    return NextResponse.json({
      success: true,
      message: `Prélèvement SEPA de ${totalAmount} € initialisé avec succès sur le réseau Stripe.`,
      transactionId: paymentIntent.id // Le vrai identifiant officiel de Stripe (pi_...)
    });

  } catch (error: any) {
    console.error("Erreur API Bancaire :", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur critique du serveur de paiement." 
    }, { status: 500 });
  }
}