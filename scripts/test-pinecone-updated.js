// New test script that follows exactly the format from the Pinecone docs
// Run with: node scripts/test-pinecone-updated.js

require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.PINECONE_API_KEY;
const assistantName = process.env.ASSISTANT_NAME_BUILDING || 'buildingregulations';

console.log(`Testing Pinecone Assistant API connection`);
console.log(`Assistant name: ${assistantName}`);
console.log(`API key found: ${apiKey ? 'Yes (last 4 chars: ' + apiKey.slice(-4) + ')' : 'No'}`);

async function testExactDocFormat() {
  try {
    console.log('\n=== Testing Pinecone Assistant using exact doc format ===');
    const { Pinecone } = require('@pinecone-database/pinecone');
    
    // Initialize Pinecone exactly as shown in the docs
    console.log('Initializing Pinecone client');
    const pc = new Pinecone({ apiKey });
    
    // Use exact casing as shown in the docs (capital A in Assistant)
    console.log(`Creating Assistant instance for: ${assistantName}`);
    const assistant = pc.Assistant(assistantName);
    
    console.log('Sending chat request...');
    const chatResp = await assistant.chat({
      messages: [{ 
        role: 'user', 
        content: 'What is the minimum stair width required in UK building regulations for residential buildings?' 
      }]
    });
    
    console.log('Response received:');
    console.log(JSON.stringify(chatResp, null, 2));
    
  } catch (error) {
    console.error(`Error in exact doc format test: ${error.message}`);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }
}

async function testUserExample() {
  try {
    console.log('\n=== Testing Pinecone Assistant using your example ===');
    const { Pinecone } = require('@pinecone-database/pinecone');
    
    // Initialize Pinecone as shown in your example
    console.log('Initializing Pinecone client');
    const pc = new Pinecone({ apiKey });
    
    // Use exact casing and parameters from your example
    console.log(`Creating Assistant instance for: ${assistantName}`);
    const assistant = pc.Assistant(assistantName);
    
    console.log('Sending chat request...');
    const response = await assistant.chat({
      messages: [{ 
        role: 'user', 
        content: 'What is the minimum stair width required in UK building regulations for residential buildings?' 
      }],
      includeHighlights: true
    });
    
    console.log("\n===== PINECONE ASSISTANT RESPONSE =====\n");
    console.log(response.content || "No response content");
    
    if (!response.citations?.length) {
      console.log("\nNo citations provided.");
      return;
    }
    
    console.log("\n\n===== CITATIONS WITH HIGHLIGHTS =====\n");
    
    response.citations.forEach((citation, i) => {
      console.log(`Citation ${i + 1}:`);
      
      citation.references?.forEach((ref, j) => {
        const { file, pages, highlight } = ref;
        const docTitle = file?.metadata?.name || 'Unknown';
        const fileName = file?.name || 'Unknown';
        const pageList = pages?.join(', ') || 'Unknown';
        
        console.log(`\n  SOURCE: ${docTitle} (${fileName}, Page(s): ${pageList})`);
        
        if (highlight?.content) {
          console.log('\n  HIGHLIGHT:');
          console.log(`  "${highlight.content.trim()}"`);
        }
      });
    });
    
  } catch (error) {
    console.error(`Error in user example test: ${error.message}`);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }
}

// Check Pinecone SDK version
const pineconePackage = require('@pinecone-database/pinecone/package.json');
console.log(`\nUsing Pinecone SDK version: ${pineconePackage.version}`);

// Run tests
(async () => {
  await testExactDocFormat();
  await testUserExample();
})(); 