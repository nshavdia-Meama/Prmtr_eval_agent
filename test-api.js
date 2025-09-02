const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Prmtr Evaluation Agent API...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Evaluate Query
    console.log('2. Testing Evaluation Query...');
    const evaluationResponse = await axios.post(`${BASE_URL}/evaluation`, {
      prompt: "What was average order value in online store for past 3 months?"
    });
    console.log('✅ Evaluation Response:', {
      success: evaluationResponse.data.success,
      id: evaluationResponse.data.data?.id,
      prompt: evaluationResponse.data.data?.prompt,
      resultLength: evaluationResponse.data.data?.result?.length || 0,
      assessmentLength: evaluationResponse.data.data?.assessment?.length || 0
    });
    console.log('');

    // Test 3: Get Evaluation History
    console.log('3. Testing Evaluation History...');
    const historyResponse = await axios.get(`${BASE_URL}/evaluation/history?limit=5`);
    console.log('✅ History Response:', {
      success: historyResponse.data.success,
      count: historyResponse.data.count,
      dataLength: historyResponse.data.data?.length || 0
    });
    console.log('');

    // Test 4: Get Specific Evaluation (if we have an ID)
    if (evaluationResponse.data.data?.id) {
      console.log('4. Testing Get Evaluation by ID...');
      const specificResponse = await axios.get(`${BASE_URL}/evaluation/${evaluationResponse.data.data.id}`);
      console.log('✅ Specific Evaluation Response:', {
        success: specificResponse.data.success,
        id: specificResponse.data.data?.id,
        prompt: specificResponse.data.data?.prompt
      });
      console.log('');
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 Make sure:');
      console.log('1. The server is running (npm run dev)');
      console.log('2. Environment variables are set correctly');
      console.log('3. Database is connected');
      console.log('4. API keys are valid');
    }
  }
}

// Run the test
testAPI();
