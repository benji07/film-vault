# Email templates

Templates HTML pour les emails transactionnels Supabase Auth, à coller manuellement dans :

**Supabase Dashboard → Authentication → Email Templates → Magic Link**

## Fichiers

| Fichier | Sujet recommandé |
| --- | --- |
| `magic-link-fr.html` | `Ton lien de connexion FilmVault` |
| `magic-link-en.html` | `Your FilmVault sign-in link` |

## Limitation Supabase

Supabase ne supporte qu'**un seul template par type d'email** à la fois (pas d'i18n natif côté Auth). Pour gérer FR + EN, deux options :

1. **Choisir une seule langue** selon ton audience principale (recommandé pour démarrer).
2. **Template bilingue** — concatène les deux versions dans un seul fichier HTML, FR au-dessus, EN en dessous (séparées par une ligne fine).
3. **Auth Hooks (avancé)** — utiliser un [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook) (Edge Function) qui choisit le template selon la locale stockée dans `user_metadata.locale`. Demande une Edge Function et un peu plus de plomberie.

## Variables disponibles

Templates Supabase utilisent la syntaxe Go templates :

- `{{ .ConfirmationURL }}` — URL complète du Magic Link (utilisée dans le bouton et le lien fallback)
- `{{ .Email }}` — adresse email du destinataire
- `{{ .SiteURL }}` — Site URL configurée dans Supabase
- `{{ .Token }}` — token brut (rare, plutôt utiliser `ConfirmationURL`)
- `{{ .RedirectTo }}` — paramètre `redirect_to` envoyé par le client

## Test

Avant de mettre en prod :

1. Coller le HTML dans le dashboard
2. Configurer le SMTP (Resend recommandé, gratuit jusqu'à 3000 mails/mois)
3. Demander un Magic Link depuis l'app en local (`npm run dev`)
4. Vérifier le rendu sur Gmail, Apple Mail, Outlook (le plus capricieux pour les CSS inline)
