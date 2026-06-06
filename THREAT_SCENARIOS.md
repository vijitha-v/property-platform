# Threat Scenario Analysis

## Application: Property Platform Backend
## Date: 2026-06-06

---

## Scenario 1: Flooding with Fake Enquiries

**How the attack works:**
Attacker uses automated scripts to send thousands of POST requests to /api/enquiry with fake data, overwhelming the database and server resources.

**Business Impact:**
- Database storage exhausted
- Legitimate enquiries lost or delayed
- Server becomes unresponsive
- CRM system flooded with fake leads

**How to reproduce:**
```bash
for i in {1..1000}; do
  curl -X POST http://localhost:3000/api/enquiry \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Fake$i\",\"email\":\"fake$i@test.com\",\"message\":\"Spam message $i\"}"
done
```

**Recommended Fix:**
- Rate limiting: 5 requests/minute per IP (implemented)
- Idempotency keys to prevent duplicates (implemented)
- CAPTCHA on frontend
- Email verification before storing enquiry

---

## Scenario 2: CRM Webhook Injection

**How the attack works:**
Attacker sends malicious payloads to /api/webhook/crm to inject harmful data into the system, potentially corrupting CRM records or executing stored XSS attacks.

**Business Impact:**
- Corrupted CRM data
- Malicious scripts stored in database
- False enquiry status updates
- Data integrity compromised

**How to reproduce:**
```bash
curl -X POST http://localhost:3000/api/webhook/crm \
  -H "Content-Type: application/json" \
  -d '{"event":"enquiry.updated","status":"<script>alert(1)</script>"}'
```

**Recommended Fix:**
- HMAC SHA256 signature verification (implemented)
- Input sanitisation on all webhook payloads (implemented)
- Whitelist allowed event types
- Store raw payload for audit trail (implemented)

---

## Scenario 3: API Overload / DDoS

**How the attack works:**
Attacker floods all API endpoints with repeated requests to exhaust server CPU, memory and database connections, crashing the backend.

**Business Impact:**
- Complete service outage
- Revenue loss
- Reputation damage
- Database connection pool exhausted

**How to reproduce:**
```bash
while true; do
  curl http://localhost:3000/api/enquiries &
done
```

**Recommended Fix:**
- Rate limiting per IP (implemented)
- Redis response caching (implemented)
- Nginx rate limiting on reverse proxy
- Cloud-based DDoS protection (Cloudflare)
- Database connection pooling (implemented via pg Pool)

---

## Scenario 4: Sensitive Information from API Errors

**How the attack works:**
Attacker sends malformed requests to trigger detailed error messages that expose stack traces, file paths, database structure or environment variables.

**Business Impact:**
- Internal system structure exposed
- Database schema leaked
- File paths and technology stack revealed
- Easier to plan further attacks

**How to reproduce:**
```bash
curl http://localhost:3000/api/enquiry/invalid-uuid-format
```

**Recommended Fix:**
- Global error handler returns generic messages (implemented)
- Stack traces only logged internally via Winston (implemented)
- NODE_ENV=production disables detailed errors
- Never expose database errors to client

---

## Scenario 5: Malicious Payload Injection

**How the attack works:**
Attacker exploits weak validation to inject SQL, XSS or NoSQL payloads into form fields that get stored in the database or reflected back to other users.

**Business Impact:**
- Database records corrupted or deleted
- XSS attacks on admin users viewing enquiries
- Data exfiltration
- Complete database compromise

**How to reproduce:**
```bash
curl -X POST http://localhost:3000/api/enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(document.cookie)</script>",
    "email": "test@test.com",
    "message": "Hello; DROP TABLE enquiries;--",
    "property_id": "1 OR 1=1"
  }'
```

**Recommended Fix:**
- express-validator sanitises all inputs (implemented)
- Parameterised SQL queries prevent injection (implemented)
- Helmet.js sets XSS protection headers (implemented)
- Input length limits enforced (implemented)
- escape() called on optional fields (implemented)