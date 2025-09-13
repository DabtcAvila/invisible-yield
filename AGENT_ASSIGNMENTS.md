# 🤖 ASIGNACIONES DE AGENTES - EJECUCIÓN PARALELA

## EQUIPO ALFA - FRONTEND EXPERIENCE
### Agent 2 (UI/UX Ninja) - `design`
```bash
npx v0@latest init invisible-yield
# Crear mockups de: Login, Dashboard, Send Money, Yield Stats
```

### Agent 3 (Frontend Speed) - `frontend`
```bash
npx create-next-app@latest invisible-yield --typescript --tailwind --app
# Implementar componentes base
```

### Agent 7 (Mobile Optimization) - `mobile`
```bash
npx create-expo-app invisible-yield-mobile
# PWA + React Native setup
```

## EQUIPO BETA - BLOCKCHAIN POWER
### Agent 4 (Cairo Master) - `smart-contracts`
```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
scarb init yield_vault
# Desarrollar contratos de yield
```

### Agent 5 (ChipiPay Integration) - `chipi`
```bash
npm install @chipipay/sdk
# Implementar wallets invisibles
```

### Agent 6 (Lightning Network) - `lightning`
```bash
npm install @atomiq/sdk
# Integrar pagos Lightning
```

## EQUIPO GAMMA - BACKEND INFRASTRUCTURE
### Agent 9 (API Architect) - `api`
```bash
npm install apollo-server graphql
# Crear GraphQL schema y resolvers
```

### Agent 10 (Database) - `database`
```bash
npx supabase init
# Setup PostgreSQL + Redis
```

### Agent 11 (Cross-chain Bridge) - `bridge`
```bash
# Implementar atomic swaps BTC-Starknet
```

## EQUIPO DELTA - YIELD & GROWTH
### Agent 12 (DeFi Strategy) - `defi`
```bash
# Integrar Troves + Vesu
# Algoritmos de optimización de yield
```

### Agent 14 (Growth Hacker) - `growth`
```bash
# Sistema de referidos
# Viral loops
# Gamification
```

## 🚀 COMANDOS DE INICIO SIMULTÁNEO
```bash
# Terminal 1-5: Ejecutar simultáneamente
tmux new-session -d -s agent1 'cd ~/hackathon-starknet && git checkout -b architecture'
tmux new-session -d -s agent2 'cd ~/hackathon-starknet && git checkout -b design'
tmux new-session -d -s agent3 'cd ~/hackathon-starknet && git checkout -b frontend'
tmux new-session -d -s agent4 'cd ~/hackathon-starknet && git checkout -b contracts'
tmux new-session -d -s agent5 'cd ~/hackathon-starknet && git checkout -b chipi'
```

## ⚡ SINCRONIZACIÓN
- Merge a main cada 2 horas
- Stand-up virtual cada 4 horas
- Resolución de conflictos por prioridad