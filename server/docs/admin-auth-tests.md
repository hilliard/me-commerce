Admin Auth Middleware Tests (Plan)
- Goal: Validate requireAuth and requireAdmin protections for admin routes.
- Assumptions:
  - JWTs are signed with a known secret (default: process.env.JWT_SECRET or 'fallback_secret').
  - Admins are stored in customers.is_admin with a corresponding humans.id referenced by humanId.
- Test Scenarios:
 1. requireAuth: Missing token -> 401
 2. requireAuth: Invalid token -> 401
 3. requireAuth: Valid token but no admin check -> proceed to next
 4. requireAdmin: No user on req -> 403
 5. requireAdmin: user.humanId exists but no admin row -> 403
 6. requireAdmin: user is admin -> next()
- Implementation Notes:
  - Use a lightweight test runner (Jest, Vitest, or Node + asserts).
  - Mock db responses or seed a test DB with an admin user for integration-style tests.
- Patch plan:
  - Create adminSeed.ts to seed admin/user as described in migrations section.
  - Create tests under server/tests/ to exercise middleware functions.
