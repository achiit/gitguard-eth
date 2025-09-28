# ContractPro Frontend

A React application for creating and managing professional freelancer contracts.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect this as a Vite project
4. Set your environment variables in Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_PRIVY_APP_ID`
   - `VITE_ALCHEMY_API_KEY`
   - `VITE_PAYSTREAM_ESCROW_ADDRESS`
   - `VITE_WRAPPED_PYUSD_ADDRESS`
5. Deploy!

The project is configured with `vercel.json` for proper SPA routing.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values. All environment variables must be prefixed with `VITE_` to be accessible in the frontend.