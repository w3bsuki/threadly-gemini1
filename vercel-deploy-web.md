# Deploy Web App to Vercel

## 1. Install Vercel CLI
```bash
npm i -g vercel
```

## 2. Deploy Web App
```bash
cd apps/web
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: threadly-web
# - Directory: ./
# - Override settings? No
```

## 3. Set Custom Domain
```bash
vercel domains add threadly.com
vercel alias threadly-web.vercel.app threadly.com
```

## 4. Environment Variables
```bash
vercel env add WEB_URL production https://threadly.com
vercel env add APP_URL production https://app.threadly.com
vercel env add NEXTAUTH_URL production https://threadly.com
```

## 5. Update Header Links
In `/apps/web/app/[locale]/components/header/index.tsx`:
- Sign Up button: `href="https://app.threadly.com/sign-up"`
- Sign In button: `href="https://app.threadly.com/sign-in"` 