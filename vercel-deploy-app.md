# Deploy App to Vercel (Subdomain)

## 1. Deploy App
```bash
cd apps/app
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: threadly-app
# - Directory: ./
# - Override settings? No
```

## 2. Set Custom Subdomain
```bash
vercel domains add app.threadly.com
vercel alias threadly-app.vercel.app app.threadly.com
```

## 3. Environment Variables
```bash
vercel env add WEB_URL production https://threadly.com
vercel env add APP_URL production https://app.threadly.com
vercel env add NEXTAUTH_URL production https://app.threadly.com
vercel env add NEXTAUTH_SECRET production [your-secret-key]
```

## 4. Update App Navigation
In `/apps/app` components:
- "Shop" button: `href="https://threadly.com"`
- "Browse Marketplace": `href="https://threadly.com"` 