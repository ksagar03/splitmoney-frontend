# SplitMoney Frontend

React Native (Expo) mobile app for the SplitMoney group-expense manager. Connects to the [SplitMoney Spring Boot backend](../splitmoney-backend) via GraphQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 via Expo ~54 |
| Language | TypeScript 5.9 (strict) |
| Routing | Expo Router (file-based) |
| API Client | Apollo Client 3.14.1 |
| State | Zustand 5.0.12 |
| Token Storage | AsyncStorage 2.2.0 |
| UI Extras | expo-linear-gradient |

---

## Project Structure

```
splitmoney-frontend/
├── app/
│   ├── _layout.tsx           # Root: ApolloProvider + AuthGuard (redirects based on auth state)
│   ├── (auth)/
│   │   └── index.tsx         # Login / Register screen (toggle between modes)
│   └── (tabs)/
│       └── index.tsx         # Home — currently empty placeholder
├── src/
│   ├── constants/theme.ts    # Color palette and font tokens
│   ├── graphql/
│   │   ├── apolloClient.tsx  # Apollo Client with JWT setContext auth link
│   │   └── mutation.tsx      # LOGIN_MUTATION, REGISTER_MUTATION
│   └── store/
│       └── useAuthStore.tsx  # Zustand: user, token, isAuthenticated, setAuth, logout
├── metro.config.js           # Enables package exports resolution for Apollo Client
├── app.json                  # Expo config (new arch, typed routes, React Compiler)
├── .env.local                # Local env vars (not committed)
├── package.json
└── tsconfig.json
```

---

## Authentication Flow

```
App Launch
    │
    ▼
AuthGuard — reads token from AsyncStorage (bootstrap)
    │
    ├── token found  → restore isAuthenticated = true in Zustand
    └── no token     → isAuthenticated stays false
            │
            ▼
    isAuthenticated = false → redirect to /(auth)   [Login/Register]
            │
            └── on success → setAuth(user, token)
                    ├── saves token to AsyncStorage (@auth_token)
                    └── sets isAuthenticated = true
                                │
                                └── AuthGuard redirects to /

    isAuthenticated = true → render /(tabs)         [Home screen]
```

**JWT is sent on every GraphQL request** via `setContext`, which reads the token from AsyncStorage and attaches `Authorization: Bearer <token>` to every request header.

---

## Local Setup

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator, Android Emulator, or Expo Go on a physical device
- SplitMoney backend running (see backend README)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the backend URL

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_GRAPHQL_URI=http://localhost:8080/graphql
```

> **Which URL to use:**
> | Testing on | URL |
> |-----------|-----|
> | Web browser | `http://localhost:8080/graphql` |
> | iOS Simulator | `http://localhost:8080/graphql` |
> | Physical phone (Expo Go) | `http://<YOUR_LOCAL_IP>:8080/graphql` |
>
> Find your local IP with: `ipconfig getifaddr en0`

### 3. Start the backend

```bash
# inside the SplitMoney backend folder
docker compose up postgres      # start only the DB in Docker
./gradlew bootRun               # run the Spring Boot app locally
```

### 4. Start the app
```bash
npm start           # Expo dev server (then press i / a / w)
npm run ios         # iOS simulator directly
npm run android     # Android emulator directly
npm run web         # Browser
```

> If you see Metro errors after changing `.env.local`, always restart with cache cleared:
> ```bash
> npm start -- --clear
> ```

---

## GraphQL Operations

All operations are defined in `src/graphql/mutation.tsx` and align with the backend schema.

### Login
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id  name  email }
  }
}
```

### Register
```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    token
    user { id  name  email }
  }
}
```

Both match the backend `AuthPayload` response type exactly.

---

## Roadmap / TODO

### In progress
- [ ] Type all GraphQL responses (replace `useMutation<any>`)
- [ ] Create `src/graphql/types.ts` for shared DTO types
- [ ] Fix `passwordInput` style — currently `styles.input` is applied inside the password container instead of `styles.passwordInput`
- [ ] Add a loading/splash screen during the bootstrap token check
- [ ] Handle Apollo network errors separately from GraphQL errors

### Next features
- [ ] Groups list screen in `(tabs)`
- [ ] `CREATE_GROUP` mutation with member selection
- [ ] Expenses list per group
- [ ] `CREATE_EXPENSE` mutation
- [ ] Balance/settlement screen (once backend exposes `calculateBalance`)
- [ ] Logout button (store action already implemented, just needs a UI entry point)
