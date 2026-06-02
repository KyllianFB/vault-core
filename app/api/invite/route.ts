import { NextResponse } from 'next/server';
// import { Resend } from 'resend';
// import Stripe from 'stripe';

// const resend = new Resend(process.env.RESEND_API_KEY);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const { nom, email_employe, poste, entreprise_id } = await request.json();

    // 1. (FUTUR) Demander à Stripe de créer un compte et un lien d'onboarding
    // const account = await stripe.accounts.create({ type: 'express', email: email_employe });
    // const accountLink = await stripe.accountLinks.create({ account: account.id, type: 'account_onboarding', ... });
    const lienOnboardingSimule = "https://connect.stripe.com/setup/s/sim_12345";

    // 2. (FUTUR) Ordonner à Resend d'envoyer l'email
    /*
    await resend.emails.send({
      from: 'Velara Vault <onboarding@velara.io>',
      to: email_employe,
      subject: 'Action Requise : Configuration de votre compte Velara',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${nom},</h2>
          <p>Vous avez été ajouté au registre financier en tant que <strong>${poste}</strong>.</p>
          <p>Pour recevoir vos fonds en toute sécurité, veuillez configurer vos coordonnées bancaires via notre partenaire Stripe :</p>
          <a href="${lienOnboardingSimule}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Configurer mon compte bancaire
          </a>
        </div>
      `
    });
    */

    // 3. On simule un délai réseau de 1.5 secondes
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      success: true, 
      message: "Employé enregistré. L'email d'onboarding Stripe a été envoyé." 
    });

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}