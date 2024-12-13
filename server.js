require("dotenv").config();
const express = require("express");
const cors = require("cors");

console.log("=== DÉMARRAGE DU SERVEUR MONHAJJ2 ===");
console.log("Environnement:", process.env.NODE_ENV || "development");

// Initialisation de Stripe avec la clé secrète
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
console.log("Stripe initialisé");

const app = express();
const port = process.env.PORT || 3000;

// Configuration de CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://monhajj2.netlify.app"] // URL du frontend en production
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Route par défaut
app.get("/", (req, res) => {
    res.json({ 
        message: "Serveur MonHajj2 en ligne!",
        environment: process.env.NODE_ENV || "development"
    });
});

// Route pour créer un Payment Intent
app.post("/api/create-payment-intent", async (req, res) => {
  console.log("\n=== NOUVELLE REQUÊTE DE PAIEMENT ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const { amount, bookingDetails } = req.body;
    console.log("Montant reçu:", amount);
    console.log("Détails de la réservation:", JSON.stringify(bookingDetails, null, 2));

    if (!amount || amount <= 0) {
      console.log("Erreur: Montant invalide");
      return res.status(400).json({ error: "Le montant est invalide" });
    }

    // Créer le payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency: "eur",
      metadata: {
        packageName: bookingDetails.packageName,
        roomType: bookingDetails.roomType,
        numberOfPeople: bookingDetails.numberOfPeople,
        customerName: bookingDetails.customerName,
        customerEmail: bookingDetails.customerEmail,
        customerPhone: bookingDetails.customerPhone
      }
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Erreur lors de la création du payment intent:", error);
    res.status(500).json({ 
      error: "Erreur lors de la création du payment intent",
      details: error.message 
    });
  }
});

// Webhook Stripe pour gérer les événements de paiement
app.post("/webhook", express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Erreur de webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent réussi:', paymentIntent.id);
      
      // Ici, vous pouvez ajouter le code pour mettre à jour Google Sheets
      // et envoyer un email de confirmation
      
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('Échec du paiement:', failedPaymentIntent.id);
      break;
  }

  res.json({received: true});
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});