# ZShield — ZecHub Hackathon 2026 Submission

## Project

**ZShield** — Sign in with Zcash

> Prove who you are. Reveal nothing else.

## Track

Zcash Login

## Team

Independent builder — ZecHub Hackathon 2026

## Links

| | |
|---|---|
| **Live demo** | https://zshield.vercel.app |
| **Source code** | https://github.com/EdCryptoFi/zshield |
| **Demo video** | https://www.youtube.com/watch?v=xqK69d5gwSA |
| **Article (X)** | https://x.com/EdCriptoFi/status/2061799056246997273 |

## What it does

ZShield turns any Zcash shielded address into a W3C DID + OIDC identity.  
No password. No email. No KYC.

1. Browser generates an Ed25519 keypair → `zauth1…` address (bech32m)
2. Server issues a signing nonce (ZIP 304 interface)
3. Wallet signs the challenge
4. Server verifies → issues JWT + Zero-Knowledge claims
5. Any OIDC-compatible app can accept this Zcash identity

### Zero-Knowledge Claims

| Claim | Proves | Hides |
|-------|--------|-------|
| `zec_holder` | Holds ≥ 1 ZEC | Exact balance |
| `active_user` | Transacted in last 30 days | Transaction details |
| `senior_holder` | Holds ≥ 10 ZEC | Exact balance |

## Stack

- **Framework:** Next.js 16 + TypeScript (App Router)
- **Auth:** NextAuth v5 beta (Credentials provider)
- **Crypto:** `@noble/ed25519` (ZIP 304 stand-in for demo)
- **Identity:** W3C DID v1.1 — `did:zcash:mainnet:<address>`
- **OIDC:** Full bridge — discovery, token, userinfo, JWKS endpoints
- **Token:** `jose` (HS256)
- **Tests:** Vitest — 5 files, 20 tests passing
- **Deploy:** Vercel

## Setup

```bash
git clone https://github.com/EdCryptoFi/zshield
cd zshield
npm install
cp .env.example .env.local
# Set AUTH_SECRET and ZCASHAUTH_SECRET (openssl rand -base64 32)
npm run dev
npm test
```

## License

MIT
