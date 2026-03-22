const axios = require('axios');

async function testLogin(email, password) {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: email,
            password: password
        });
        console.log('LOGIN SUCCESS:', response.data);
    } catch (error) {
        console.error('LOGIN FAILURE:', error.response ? error.response.data : error.message);
    }
}

// You can replace these with the credentials you are trying to use
const testEmail = 'test@example.com';
const testPassword = 'password123';

testLogin(testEmail, testPassword);
