# MonHajj2 Backend

Backend pour l'application MonHajj2, gérant les paiements via Stripe.

## Configuration

### Variables d'environnement requises

Ces variables doivent être configurées dans les paramètres de votre service Render.com :

- `STRIPE_SECRET_KEY` : Votre clé secrète Stripe (commence par sk_test_ pour l'environnement de test)
- `NODE_ENV` : "production" pour l'environnement de production
- `PORT` : Le port sur lequel le serveur doit écouter (généralement fourni automatiquement par Render)

### Configuration sur Render.com

1. Allez sur votre dashboard Render.com
2. Sélectionnez votre service "monhajj2backend"
3. Cliquez sur "Environment" dans le menu
4. Ajoutez les variables d'environnement listées ci-dessus

## Endpoints API

### POST /create-payment-intent

Crée une intention de paiement Stripe.

**Corps de la requête :**
```json
{
  "amount": 1000,    // Montant en euros
  "currency": "eur"  // Code de la devise
}
```

**Réponse :**
```json
{
  "clientSecret": "pi_..."  // Client secret pour confirmer le paiement côté client
}
```
