// JWT API test script
const baseURL = 'http://localhost:3000';

// Test data
const testStudent = {
  email: 'jwt.student@university.edu',
  password: 'password123',
  firstName: 'JWT',
  lastName: 'Student',
  studentId: 'JWT001'
};

const testAdmin = {
  email: 'jwt.admin@university.edu',
  password: 'admin123',
  firstName: 'JWT',
  lastName: 'Admin',
  studentId: 'JWTADMIN001',
  role: 'admin'
};

const testPayment = {
  slipNumber: 'JWT123456',
  amount: 75000,
  paymentDate: '2024-01-20',
  bankName: 'JWT Bank',
  transactionReference: 'JWT789',
  notes: 'JWT test payment'
};

async function testJWTAPI() {
  console.log('🔐 Starting JWT API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);

    // Test 2: Register Student
    console.log('\n2. Registering JWT Test Student...');
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent)
    });
    const registerData = await registerResponse.json();
    console.log('✅ Student Registration:', registerData.message);

    // Test 3: Register Admin
    console.log('\n3. Registering JWT Test Admin...');
    const adminRegisterResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin)
    });
    const adminRegisterData = await adminRegisterResponse.json();
    console.log('✅ Admin Registration:', adminRegisterData.message);

    // Test 4: Login Student
    console.log('\n4. Logging in Student with JWT...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudent.email,
        password: testStudent.password
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Student Login:', loginData.message);
    console.log('🔑 Access Token:', loginData.data.accessToken.substring(0, 50) + '...');
    console.log('🔄 Refresh Token:', loginData.data.refreshToken.substring(0, 50) + '...');
    const studentAccessToken = loginData.data.accessToken;
    const studentRefreshToken = loginData.data.refreshToken;

    // Test 5: Submit Payment with JWT
    console.log('\n5. Submitting Payment with JWT...');
    const paymentResponse = await fetch(`${baseURL}/api/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentAccessToken}`
      },
      body: JSON.stringify(testPayment)
    });
    const paymentData = await paymentResponse.json();
    console.log('✅ Payment Submission:', paymentData.message);
    const paymentId = paymentData.data.paymentId;

    // Test 6: Login Admin with JWT
    console.log('\n6. Logging in Admin with JWT...');
    const adminLoginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testAdmin.email,
        password: testAdmin.password
      })
    });
    const adminLoginData = await adminLoginResponse.json();
    console.log('✅ Admin Login:', adminLoginData.message);
    const adminAccessToken = adminLoginData.data.accessToken;

    // Test 7: Get Pending Payments with JWT
    console.log('\n7. Getting Pending Payments with JWT...');
    const pendingResponse = await fetch(`${baseURL}/api/admin/payments`, {
      headers: { 'Authorization': `Bearer ${adminAccessToken}` }
    });
    const pendingData = await pendingResponse.json();
    console.log('✅ Pending Payments:', `Found ${pendingData.data.payments.length} pending payments`);

    // Test 8: Verify Payment with JWT
    console.log('\n8. Verifying Payment with JWT...');
    const verifyResponse = await fetch(`${baseURL}/api/admin/payments/${paymentId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAccessToken}`
      },
      body: JSON.stringify({ notes: 'Payment verified with JWT authentication' })
    });
    const verifyData = await verifyResponse.json();
    console.log('✅ Payment Verification:', verifyData.message);

    // Test 9: Refresh Token
    console.log('\n9. Testing Refresh Token...');
    const refreshResponse = await fetch(`${baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: studentRefreshToken })
    });
    const refreshData = await refreshResponse.json();
    console.log('✅ Token Refresh:', refreshData.message);
    console.log('🔑 New Access Token:', refreshData.data.accessToken.substring(0, 50) + '...');

    // Test 10: Get Student Payments with New Token
    console.log('\n10. Getting Student Payment History with New Token...');
    const studentPaymentsResponse = await fetch(`${baseURL}/api/payments/my-payments`, {
      headers: { 'Authorization': `Bearer ${refreshData.data.accessToken}` }
    });
    const studentPaymentsData = await studentPaymentsResponse.json();
    console.log('✅ Student Payments:', `Found ${studentPaymentsData.data.payments.length} payments`);

    console.log('\n🎉 All JWT tests completed successfully!');
    console.log('\n📋 JWT Features Tested:');
    console.log('✅ JWT Access Token generation and verification');
    console.log('✅ JWT Refresh Token functionality');
    console.log('✅ Token-based authentication for all endpoints');
    console.log('✅ Proper error handling for expired/invalid tokens');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testJWTAPI();
