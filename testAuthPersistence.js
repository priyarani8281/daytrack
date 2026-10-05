import assert from 'assert';

const API = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🔐 Testing Authentication & Session Persistence Requirements...\n');

  const testEmail = `user_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Alex Mercer';

  // 1. Register new user
  console.log('-> 1. Testing User Registration...');
  const regRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
  });
  assert.strictEqual(regRes.status, 201, 'Registration should return 201 Created');
  const regData = await regRes.json();
  assert(regData.token, 'Registration must return a JWT token');
  assert(regData.user, 'Registration must return user profile');
  assert.strictEqual(regData.user.email, testEmail);
  assert.strictEqual(regData.user.password, undefined, 'Plaintext password must NEVER be exposed in response');
  console.log(`   ✅ Registered user: ${regData.user.name} (${regData.user.email})`);
  console.log(`   ✅ Token length: ${regData.token.length} chars (JWT)`);

  const initialToken = regData.token;

  // 2. Verify Session with /api/auth/me using initialToken
  console.log('-> 2. Verifying Session Persistence with /api/auth/me...');
  const meRes = await fetch(`${API}/auth/me`, {
    headers: { 'Authorization': `Bearer ${initialToken}` }
  });
  assert.strictEqual(meRes.status, 200, 'Authenticated session check should succeed');
  const meData = await meRes.json();
  assert.strictEqual(meData.user.id, regData.user.id);
  assert.strictEqual(meData.user.password, undefined, 'Password must not be returned in /me');
  console.log(`   ✅ Session verified: ID ${meData.user.id}, Streak: ${meData.user.currentStreak}d`);

  // 3. Test Login with newly registered credentials
  console.log('-> 3. Testing Login with New Credentials...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  assert.strictEqual(loginRes.status, 200, 'Login must succeed with registered credentials');
  const loginData = await loginRes.json();
  assert(loginData.token, 'Login must return a valid token');
  assert.strictEqual(loginData.user.email, testEmail);
  console.log(`   ✅ Login successful for ${loginData.user.email}`);

  // 4. Test Login with wrong password
  console.log('-> 4. Testing Login with Incorrect Password...');
  const badLoginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999' })
  });
  assert.strictEqual(badLoginRes.status, 401, 'Bad credentials must return 401 Unauthorized');
  console.log('   ✅ Bad password correctly rejected with 401 Unauthorized');

  // 5. Protected Route Access with Token
  console.log('-> 5. Testing Protected Endpoints (Dashboard & Categories)...');
  const dashRes = await fetch(`${API}/occurrences/dashboard`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  assert.strictEqual(dashRes.status, 200, 'Protected dashboard accessible with valid token');
  const dash = await dashRes.json();
  console.log(`   ✅ Dashboard initialized for new user, tasks count: ${dash.todayTasks.length}`);

  // 6. Protected Route Access without Token (should reject 401)
  console.log('-> 6. Testing Protected Endpoints without Token (Logout state)...');
  const unauthRes = await fetch(`${API}/occurrences/dashboard`);
  assert.strictEqual(unauthRes.status, 401, 'Protected route must reject unauthenticated requests');
  console.log('   ✅ Unauthenticated request correctly rejected with 401');

  console.log('\n🎉 ALL AUTHENTICATION & SESSION PERSISTENCE CHECKS PASSED!\n');
}

testAuth().catch(err => {
  console.error('❌ Auth test failed:', err);
  process.exit(1);
});
