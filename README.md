# SplitMoney Frontend

React Native (Expo) mobile app for the SplitMoney group-expense manager. Connects to the [SplitMoney Spring Boot backend](../splitmoney-backend) via GraphQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 via Expo ~54 |
| Language | TypeScript 5.9 (strict) |
| Routing | Expo Router (file-based) |
| API Client | Apollo Client 4.1.7 |
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
│   │   ├── apolloClient.tsx  # Apollo client with JWT auth link
│   │   └── mutation.tsx      # LOGIN_MUTATION, REGISTER_MUTATION
│   └── store/
│       └── useAuthStore.tsx  # Zustand: user, token, isAuthenticated, setAuth, logout
├── app.json                  # Expo config (new arch, typed routes, React Compiler)
├── package.json
└── tsconfig.json
```

---

## Authentication Flow

```
App Launch
    │
    ▼
AuthGuard checks isAuthenticated (Zustand)
    │
    ├── false → redirect to /(auth)   [Login/Register screen]
    │               │
    │               └── on success → setAuth(user, token)
    │                       ├── saves token to AsyncStorage (@auth_token)
    │                       └── sets isAuthenticated = true
    │                               │
    │                               └── AuthGuard redirects to /
    │
    └── true  → render /(tabs)        [Home screen]
```

**JWT is sent on every GraphQL request** via `SetContextLink`, which reads the token from AsyncStorage and attaches `Authorization: Bearer <token>` to every request header.

---

## Local Setup

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go)
- SplitMoney backend running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the backend URL

Open `src/graphql/apolloClient.tsx` and update the URI with your machine's local IP and the correct port:

```ts
uri: 'http://<YOUR_LOCAL_IP>:8080/graphql',
```

> The backend (Spring Boot) runs on port **8080** by default. See [environment variables](#environment-variables) below for a cleaner approach.

### 3. Start
```bash
npm start           # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Browser
```

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

These match the backend `AuthPayload` response type exactly.

---

## Environment Variables

No `.env` file exists yet. The GraphQL URI is hardcoded in `apolloClient.tsx`.

**Recommended**: create a `.env.local` file and use the `EXPO_PUBLIC_` prefix so Expo picks it up at build time:

```env
EXPO_PUBLIC_GRAPHQL_URI=http://192.168.1.x:8080/graphql
```

Then in `apolloClient.tsx`:
```ts
uri: process.env.EXPO_PUBLIC_GRAPHQL_URI,
```

---

## Code Review

### What's working well
- Clean separation of concerns: routing, state, API client, and mutations are each in their own file.
- Auth guard in the root layout is the right pattern for Expo Router — single source of truth for redirect logic.
- `SetContextLink` correctly attaches the Bearer token to every request without the component layer having to think about it.
- Login and Register mutations align perfectly with the backend GraphQL schema and `AuthPayload` type.
- Loading state (`loginLoading || registerLoading`) prevents double-submission.
- `KeyboardAvoidingView` + `SafeAreaView` combination handles different device layouts correctly.

---

### Issues & Fixes

#### Critical

**1. Wrong backend port**

`apolloClient.tsx:7` — the URI uses port `4000`, but Spring Boot defaults to `8080`.

```ts
// current (broken)
uri: 'http://192.168.1.X:4000/graphql',

// correct
uri: 'http://<YOUR_LOCAL_IP>:8080/graphql',
```

---

**2. Auth state not restored on app restart**

`useAuthStore` initialises `isAuthenticated: false` on every cold start. Even though the JWT token is persisted in AsyncStorage, Zustand state resets and `AuthGuard` immediately redirects to the login screen.

Fix — add a bootstrap effect in `app/_layout.tsx` that reads the stored token before the guard runs:

```ts
// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/src/store/useAuthStore';

function AuthGuard() {
  const { isAuthenticated, setAuth, token } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem('@auth_token');
      if (storedToken) {
        // Rehydrate — at minimum mark as authenticated so the guard doesn't redirect
        // Ideally also re-fetch the user profile here
        useAuthStore.setState({ token: storedToken, isAuthenticated: true });
      }
      setIsBootstrapping(false);
    })();
  }, []);

  useEffect(() => {
    if (isBootstrapping) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) router.replace('/(auth)');
    else if (isAuthenticated && inAuthGroup) router.replace('/');
  }, [isAuthenticated, segments, isBootstrapping]);

  if (isBootstrapping) return null; // or a splash/loading screen
  return <Slot />;
}
```

---

#### Medium

**3. `passwordInput` style is defined but never applied**

`app/(auth)/index.tsx:207` — a `passwordInput` style is declared in `StyleSheet.create` but the `TextInput` inside the password container uses the `input` style instead. The password field likely renders incorrectly (missing flex: 1 so it won't fill the row).

```ts
// current
<TextInput style={styles.input} .../>

// should be
<TextInput style={styles.passwordInput} .../>
```

---

**4. No typed GraphQL responses**

Both mutations use `useMutation<any>`. TypeScript gives you zero safety when reading `data.login.user`. Define the response types:

```ts
// src/graphql/types.ts
interface AuthUser { id: string; name: string; email: string; }
interface AuthPayload { token: string; user: AuthUser; }
export interface LoginResponse  { login: AuthPayload; }
export interface RegisterResponse { register: AuthPayload; }
```

Then use them:
```ts
useMutation<LoginResponse>(LOGIN_MUTATION)
useMutation<RegisterResponse>(REGISTER_MUTATION)
```

---

**5. Hardcoded network URL**

`apolloClient.tsx:7` — the IP and port are hardcoded. This breaks for other team members and for different environments. Use `EXPO_PUBLIC_GRAPHQL_URI` as described in [Environment Variables](#environment-variables).

---

#### Minor

**6. Token stored twice**

`setAuth` stores the token in AsyncStorage *and* in Zustand state (`set({ token })`). The Apollo authLink reads from AsyncStorage, not from Zustand. The Zustand `token` field is redundant — keep it if you want it accessible in components, but document the two sources so they don't drift.

**7. Error message from Apollo is often not user-friendly**

`error.message` in the catch block often returns the raw GraphQL error string (e.g., `"Response not successful: Received status code 400"`). Extract `error.graphQLErrors[0]?.message` for clearer user-facing alerts.

---

### Direction Assessment

The overall direction is correct. The tech choices (Expo Router, Apollo Client, Zustand, AsyncStorage) are appropriate and well-matched to the backend. The architecture scales cleanly — adding new screens, queries, and stores follows the same pattern already established. The critical blocker right now is the port mismatch and the missing auth rehydration on restart; fix those two and the auth flow will work end-to-end.

---

## Roadmap / TODO

### Immediate (unblock auth)
- [ ] Fix backend URL port: `4000` → `8080`
- [ ] Rehydrate auth state from AsyncStorage on cold start
- [ ] Fix `passwordInput` style not applied to password TextInput
- [ ] Move GraphQL URI to `EXPO_PUBLIC_GRAPHQL_URI` env var

### Next features (matching backend capabilities)
- [ ] Add `GET_GROUPS` query and a groups list screen in `(tabs)`
- [ ] Add `CREATE_GROUP` mutation with member selection
- [ ] Add `GET_EXPENSES` query per group
- [ ] Add `CREATE_EXPENSE` mutation
- [ ] Add `GET_BALANCE` query once the backend exposes `calculateBalance`
- [ ] Logout button (store action already implemented, just needs a UI entry point)

### Quality
- [ ] Type all GraphQL responses (remove `useMutation<any>`)
- [ ] Create a `types/graphql.ts` file for shared DTO types
- [ ] Add a loading/splash screen during the bootstrap token check
- [ ] Handle Apollo network errors separately from GraphQL errors in the catch block
