# IDEAL COACHING CENTRE — AUTHENTICATION SPECIFICATION

## 1. Zero-SMS & Email OTP Mandate
In strict compliance with the **Strict Zero-Paid-Service Policy**, IDEAL COACHING CENTRE does not use SMS gateways or mobile OTP services. 

- **OTP Delivery**: Strictly sent **ONLY** to the student's registered email address.
- **Mobile Numbers & Usernames**: Act as login identifiers only; they are **never** OTP delivery channels.
- **Passwords**: Not mandatory for the normal student login flow. Authentication is passwordless via secure 6-digit Email OTP.

---

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (App or Web)
    participant Client as Frontend Client (React Native / Next.js)
    participant Edge as Edge Function (auth-lookup)
    participant DB as PostgreSQL (resolve_identifier_for_auth)
    participant Auth as Supabase Auth Service
    actor Email as Student's Email Inbox

    Student->>Client: Enters Mobile Number / Username / Email<br/>(e.g. "9876543210")
    Client->>Edge: POST /functions/v1/auth-lookup<br/>{"identifier": "9876543210"}
    
    Edge->>DB: rpc('resolve_identifier_for_auth', { p_identifier })
    Note over DB: 1. Normalizes input<br/>2. Checks rate limits (5 per 10m)<br/>3. Queries profiles table<br/>4. Masks email (s****k@gmail.com)
    DB-->>Edge: Returns internal user record & masked email
    
    alt User Exists & Active
        Edge->>Auth: admin.auth.signInWithOtp({ email })
        Auth->>Email: Delivers 6-digit OTP code to registered inbox
        Edge-->>Client: 200 OK: {"success": true, "masked_email": "s****k@gmail.com"}
    else User Not Found
        Edge-->>Client: 200 OK: {"success": true, "message": "If account exists, OTP was sent."}
    end

    Client->>Student: Prompts: "Enter 6-digit OTP sent to s****k@gmail.com"
    Student->>Email: Checks inbox, copies 6-digit OTP
    Student->>Client: Enters OTP (e.g. 543219)
    Client->>Auth: supabase.auth.verifyOtp({ email, token, type: 'email' })
    Auth-->>Client: JWT Access Token & Refresh Token
    Client->>Student: Logs in -> Navigates to Student Dashboard
```

---

## 3. Account Enumeration & Leaking Defense
To protect student privacy:
1. Unauthenticated clients **cannot** query the `profiles` table directly (protected by RLS).
2. The `resolve_identifier_for_auth` PostgreSQL function is marked `SECURITY DEFINER` and its execution is revoked from public users, only granted to `service_role`.
3. If an unrecognized identifier is entered, the response is structurally identical to a recognized one, returning a generic success message without leaking account existence.
4. If a recognized identifier is found, only a **masked email** (e.g. `r****a@gmail.com`) is provided to help the student know which inbox to check, preventing leakage of private contact details.

---

## 4. Rate Limiting Policy
- Maximum **5 OTP requests** per 10-minute window per identifier.
- Tracked internally in the `otp_rate_limits` table.
- Violators receive an explicit bilingual cooldown notice:
  *"कृपया 10 मिनट प्रतीक्षा करें। बहुत अधिक अनुरोध किए गए हैं। (Too many attempts. Please wait 10 minutes.)"*
