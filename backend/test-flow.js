const axios = require('axios');

async function testAuthFlow() {
    const timestamp = Date.now();
    const userData = {
        username: `user_${timestamp}`,
        email: `email_${timestamp}@test.com`,
        password: 'password123'
    };

    try {
        // 1. Register
        console.log('--- Step 1: Registering user ---');
        const regRes = await axios.post('http://localhost:5000/api/auth/register', userData);
        console.log('Registration Response:', regRes.data);

        // 2. Login
        console.log('\n--- Step 2: Logging in with new user ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: userData.email,
            password: userData.password
        });
        console.log('Login Success! Token:', loginRes.data.token.substring(0, 20) + '...');
        console.log('User:', loginRes.data.user);

    } catch (error) {
        console.error('\nFAILURE:', error.response ? error.response.data : error.message);
    }
}

testAuthFlow();
