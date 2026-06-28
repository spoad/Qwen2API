const axios = require('axios');
const accountManager = require('./src/utils/account.js');

async function test() {
  const currentAccount = accountManager.getAccount();
  console.log('Account:', currentAccount?.email);
  console.log('Token:', currentAccount?.token ? 'exists' : 'missing');
  
  if (!currentAccount?.token) {
    console.log('No token found');
    return;
  }
  
  const chatBaseUrl = 'https://chat.qwen.ai';
  const chat_id = 'test-chat-id';
  
  try {
    const response = await axios.post(
      `${chatBaseUrl}/api/v2/chat/completions?chat_id=${chat_id}`,
      {
        model: 'qwen3.7-plus',
        messages: [{role: 'user', content: '请直接回复数字 123'}],
        stream: true
      },
      {
        headers: {
          'authorization': `Bearer ${currentAccount.token}`,
          'content-type': 'application/json',
          'accept': 'text/event-stream'
        },
        responseType: 'stream'
      }
    );
    
    console.log('Response status:', response.status);
    
    return new Promise((resolve, reject) => {
      let fullData = '';
      response.data.on('data', (chunk) => {
        const text = chunk.toString();
        fullData += text;
        console.log('Raw Chunk:', text);
      });
      response.data.on('end', () => {
        console.log('Stream ended');
        console.log('Full data length:', fullData.length);
        resolve();
      });
      response.data.on('error', reject);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
