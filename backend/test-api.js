const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123'
        });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.error('FAILURE:', error.response ? error.response.data : error.message);
    }
}

testRegister();
