# FATURA365

Platformë për gjenerimin e faturave me React + AWS Amplify (Auth + Data), gati për deploy në `fatura365.com`.

## 1) Setup lokal

```bash
npm install
npm run amplify:sandbox
npm run dev
```

Pas `amplify:sandbox`, Amplify gjeneron konfigurimin. Nëse nuk është shkruar automatikisht, kopjo output në `amplify_outputs.json`.

## 2) Variablat e ambientit

Krijo/plotëso `.env.local`:

```env
GEMINI_API_KEY=...
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
VITE_ADSENSE_SLOT_ID=1234567890
```

## 3) Backend (Amplify Gen 2)

Ky repo përfshin:
- `amplify/auth/resource.ts` (email sign in/sign up)
- `amplify/data/resource.ts` (Business, Client, Invoice me owner auth)
- `amplify/backend.ts`

Deploy backend + frontend nga Amplify Console ose me CLI:

```bash
npm run amplify:deploy
npm run build
```

## 4) Lidhja me GitHub (arsyeja pse commit s'u pa)

Commit-i lokal nuk shfaqet në GitHub pa `remote`.

```bash
git remote add origin https://github.com/<username>/<repo>.git
git branch -M main
git push -u origin main
```

Kontrollo remotes:

```bash
git remote -v
```

## 5) Domain `fatura365.com`

Në Amplify Console:
1. Host app nga branch `main`
2. **Domain management** -> Add domain -> `fatura365.com`
3. Shto records DNS te regjistrari i domain-it sipas Amplify
4. Aktivizo HTTPS (AWS Certificate Manager automatik)

## 6) Ads

`components/AdBanner.tsx` përdor Google AdSense nëse janë vendosur:
- `VITE_ADSENSE_CLIENT_ID`
- `VITE_ADSENSE_SLOT_ID`

Nëse mungojnë, ads nuk shfaqen.
