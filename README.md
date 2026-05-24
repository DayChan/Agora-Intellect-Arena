# Agora Intellect Arena (ArcAlpha)

An advanced decentralized prediction and autonomous agent venue built on the **Arc Testnet** and powered by **Circle Programmable Wallets SDK**.

![ArcAlpha Preview](https://via.placeholder.com/1200x600/030303/00e6b4?text=Agora+Intellect+Arena)

## 🌟 Core Features

- **Real-time Arc Testnet Integration**: Live balance fetching for USDC (Native), EURC, and USYC directly from the blockchain.
- **Autonomous Wallet Agents**: Experience the future of finance where AI Agents execute trades autonomously using Circle's Programmable Wallets (User-to-API controlled delegation).
- **Private Arc L1 Explorer**: A personalized block explorer that filters and persists only your wallet's transaction history using LocalStorage.
- **Gasless Simulation**: Integrated Circle Paymaster logic for a seamless, sponsored gas experience.
- **Deep Reasoning Terminal**: Real-time visualization of Agent "thought processes" and execution logs.

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **Web3**: ethers.js/viem patterns (via standard RPC), MetaMask Integration
- **SDKs**: Simulated Circle Programmable Wallets & Paymaster integration
- **Styling**: Modern, Dark-themed CSS with Greek-inspired aesthetics

## 🚀 Deployment

### Deploying to Vercel

The easiest way to deploy this project is via the [Vercel Platform](https://vercel.com/new).

1. **Push your code** to a GitHub repository.
2. **Import the project** in Vercel.
3. Vercel will automatically detect **Vite** and configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**.

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔗 Network Details (Arc Testnet)

To view your transactions and balances, add the Arc Testnet to your wallet:

- **Network Name**: Arc Testnet
- **RPC URL**: `https://rpc.testnet.arc.network`
- **Chain ID**: `5042002`
- **Currency Symbol**: `USDC`
- **Block Explorer**: [testnet.arcscan.app](https://testnet.arcscan.app)

---

Built with ⚡ on Arc Testnet.
