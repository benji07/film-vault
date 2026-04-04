# 🎞️ FilmVault

Gestionnaire de pellicules argentiques — PWA avec thème Darkroom.

## Déployer sur GitHub Pages

1. Crée un nouveau repo sur GitHub
2. Push ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:TON_USER/filmvault.git
   git push -u origin main
   ```
3. Va dans **Settings → Pages → Source** et choisis **GitHub Actions**
4. Le workflow se lance automatiquement au push et déploie le site

## Dev local

```bash
npm install
npm run dev
```

## Stack

- React 18
- Vite
- Lucide Icons
- localStorage pour la persistance
- Thème Darkroom (tons sombres, accent rouge safelight)
