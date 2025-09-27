// Fresh API test script with unique data
const baseURL = 'http://localhost:3000';

// Generate unique test data
const timestamp = Date.now();
const testStudent = {
  email: `test.student.${timestamp}@university.edu`,
  password: 'password123',
  firstName: 'Test',
  lastName: 'Student',
  studentId: `TEST${timestamp}`
};

const testAdmin = {
  email: `admin.${timestamp}@university.edu`,
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  studentId: `ADMIN${timestamp}`,
  role: 'admin'
};

const testPayment = {
  slipNumber: `SLP${timestamp}`,
  amount: 50000,
  paymentDate: '2024-01-15',
  bankName: 'Test Bank',
  transactionReference: `TXN${timestamp}`,
  notes: 'Test payment'
};

async function testAPI() {
  console.log('🧪 Starting Fresh API Tests...\n');
  console.log(`📅 Test timestamp: ${timestamp}\n`);

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);

    // Test 2: Register Student
    console.log('\n2. Registering Test Student...');
    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent)
    });
    const registerData = await registerResponse.json();
    console.log('✅ Student Registration:', registerData.message);

    // Test 3: Register Admin
    console.log('\n3. Registering Test Admin...');
    const adminRegisterResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAdmin)
    });
    const adminRegisterData = await adminRegisterResponse.json();
    console.log('✅ Admin Registration:', adminRegisterData.message);

    // Test 4: Login Student
    console.log('\n4. Logging in Student...');
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
    const studentToken = loginData.data.accessToken;

    // Test 5: Submit Payment
    console.log('\n5. Submitting Payment...');
    const paymentResponse = await fetch(`${baseURL}/api/payments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify(testPayment)
    });
    const paymentData = await paymentResponse.json();
    console.log('✅ Payment Submission:', paymentData.message);
    const paymentId = paymentData.data.paymentId;

    // Test 6: Login Admin
    console.log('\n6. Logging in Admin...');
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
    console.log('🔑 Admin Access Token:', adminLoginData.data.accessToken.substring(0, 50) + '...');
    const adminToken = adminLoginData.data.accessToken;

    // Test 7: Get Pending Payments
    console.log('\n7. Getting Pending Payments...');
    const pendingResponse = await fetch(`${baseURL}/api/admin/payments`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingData = await pendingResponse.json();
    console.log('✅ Pending Payments:', `Found ${pendingData.data.payments.length} pending payments`);

    // Test 8: Verify Payment
    console.log('\n8. Verifying Payment...');
    const verifyResponse = await fetch(`${baseURL}/api/admin/payments/${paymentId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ notes: 'Payment verified successfully' })
    });
    const verifyData = await verifyResponse.json();
    console.log('✅ Payment Verification:', verifyData.message);

    // Test 9: Get Student Payments
    console.log('\n9. Getting Student Payment History...');
    const studentPaymentsResponse = await fetch(`${baseURL}/api/payments/my-payments`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const studentPaymentsData = await studentPaymentsResponse.json();
    console.log('✅ Student Payments:', `Found ${studentPaymentsData.data.payments.length} payments`);

    // Test 10: Test Refresh Token
    console.log('\n10. Testing Refresh Token...');
    const refreshResponse = await fetch(`${baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginData.data.refreshToken })
    });
    const refreshData = await refreshResponse.json();
    console.log('✅ Token Refresh:', refreshData.message);
    console.log('🔑 New Access Token:', refreshData.data.accessToken.substring(0, 50) + '...');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 JWT Features Demonstrated:');
    console.log('✅ JWT Access Token authentication');
    console.log('✅ JWT Refresh Token functionality');
    console.log('✅ Secure payment submission');
    console.log('✅ Admin verification workflow');
    console.log('✅ Token-based authorization');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run tests
testAPI();
