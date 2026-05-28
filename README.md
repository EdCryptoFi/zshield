# ZShield — Sign in with Zcash

> **Prove who you are. Reveal nothing else.**

ZShield turns any Zcash address into a W3C DID + OIDC identity — no password, no email, no KYC. Built for the [ZecHub Hackathon 2026](https://zechub.wiki).

🔗 **Live demo:** https://zshield.vercel.app

---

## What it does

| Step | What happens | Tech |
|------|-------------|------|
| 1 | Browser generates an Ed25519 keypair | `@noble/ed25519` |
| 2 | Public key → `zauth1…` address (bech32m) + `did:zcash:mainnet:…` DID | W3C DID v1.1 |
| 3 | Server issues a random nonce; wallet signs it (ZIP 304 interface) | Challenge-response |
| 4 | Server verifies signature → issues JWT + ZK claims | `jose` HS256 |
| 5 | Any OIDC-compatible app can now verify this identity | OIDC / OAuth2 |

### Zero-Knowledge claims

| Claim | Proves | Hides |
|-------|--------|-------|
| `zec_holder` | Holds ≥ 1 ZEC | Exact balance |
| `active_user` | Transacted in last 30 days | Transaction details |
| `senior_holder` | Holds ≥ 10 ZEC | Exact balance |

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth v5 beta (Credentials provider) |
| Crypto | `@noble/ed25519` (ZIP 304 stand-in) |
| Identity | W3C DID v1.1 · `did:zcash` method |
| OIDC | Custom bridge: discovery, token, userinfo, JWKS |
| Token | `jose` (EdDSA / HS256) |
| Address | bech32m (`zauth1…` prefix for demo) |
| Tests | Vitest — 5 files, 20 tests |
| Deploy | Vercel |

---

## Local setup

```bash
git clone https://github.com/YOUR_ORG/zshield
cd zshield
npm install
cp .env.example .env.local
# fill in AUTH_SECRET and ZCASHAUTH_SECRET
npm run dev
```

### Environment variables

```
AUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=         # http://localhost:3000 (local) or https://… (prod)
ZCASHAUTH_SECRET=     # openssl rand -base64 32
```

### Tests

```bash
npm test
```

---

## OIDC endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/.well-known/openid-configuration` | OIDC discovery |
| `POST` | `/api/challenge` | Issue signing nonce |
| `POST` | `/api/verify` | Verify signature, issue JWT |
| `POST` | `/api/oidc/token` | Token exchange |
| `GET` | `/api/oidc/userinfo` | Address + DID + ZK claims |
| `GET` | `/api/oidc/jwks` | JWK Set |

---

## Production roadmap

- [ ] Replace Ed25519 with real ZIP 304 via `librustzcash` WASM
- [ ] Integrate Zashi / Zingolib for mobile wallet signing
- [ ] Live ZK claims via `lightwalletd` gRPC
- [ ] QR code flow for mobile
- [ ] Redis nonce store for multi-instance deployments

---

Built for **ZecHub Hackathon 2026** · Track: Zcash Login · Prize pool: 25 ZEC
