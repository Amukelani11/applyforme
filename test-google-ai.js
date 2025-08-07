// Test Google AI API key
async function testGoogleAI() {
  console.log('🧪 Testing Google AI API Key...\n')
  
  // Check if the environment variable is available
  const apiKey = process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
      console.log('❌ GOOGLE_API_KEY environment variable is not set')
  console.log('Please set it in your .env.local file:')
  console.log('GOOGLE_API_KEY=your_api_key_here')
    return
  }
  
  console.log('✅ API Key found (length:', apiKey.length, ')')
  
  try {
    // Test a simple API call
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello! Please respond with 'API key is working' if you can see this message."
          }]
        }]
      })
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Key is working!')
      console.log('Response:', data.candidates[0].content.parts[0].text)
    } else {
      const errorText = await response.text()
      console.log('❌ API Key test failed')
      console.log('Error:', errorText)
    }
    
  } catch (error) {
    console.log('❌ Error testing API key:', error.message)
  }
}

testGoogleAI().catch(console.error) 