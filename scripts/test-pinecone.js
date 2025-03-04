// Simple test script to verify Pinecone Assistant API connection
// Run with: node scripts/test-pinecone.js

require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PINECONE_API_KEY;
const assistantName = process.env.ASSISTANT_NAME_BUILDING || 'buildingregulations';

console.log(`Testing Pinecone Assistant API connection`);
console.log(`Assistant name: ${assistantName}`);
console.log(`API key found: ${apiKey ? 'Yes (last 4 chars: ' + apiKey.slice(-4) + ')' : 'No'}`);

// First approach: Direct API call
async function testDirectAPICall() {
  console.log('\n=== Testing direct API call ===');
  
  try {
    const url = `https://api.pinecone.io/assistants/${assistantName}/chat`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'user', 
            content: 'What is a Building Regulation?' 
          }
        ],
        stream: false,
        include_highlights: true
      }),
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${errorText}`);
    } else {
      const data = await response.json();
      console.log('Success! Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Second approach: Using Pinecone SDK
async function testSDKCall() {
  console.log('\n=== Testing Pinecone SDK approach ===');
  
  try {
    const { Pinecone } = require('@pinecone-database/pinecone');
    
    console.log('Initializing Pinecone client');
    const pc = new Pinecone({ apiKey });
    
    // Try both ways of accessing the assistant
    try {
      console.log(`\nApproach 1: Using pc.assistant("${assistantName}")`);
      const assistant = pc.assistant(assistantName);
      const response = await assistant.chat({
        messages: [{ 
          role: 'user', 
          content: 'What is a Building Regulation?' 
        }],
      });
      console.log('Success! Response:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(`Error with approach 1: ${error.message}`);
    }
    
    try {
      console.log(`\nApproach 2: Using pc.Assistant("${assistantName}")`);
      const assistant = pc.Assistant(assistantName);
      const response = await assistant.chat({
        messages: [{ 
          role: 'user', 
          content: 'What is a Building Regulation?' 
        }],
      });
      console.log('Success! Response:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(`Error with approach 2: ${error.message}`);
    }
    
  } catch (error) {
    console.error('SDK initialization error:', error.message);
  }
}

// Run tests
(async () => {
  await testDirectAPICall();
  await testSDKCall();
})(); 