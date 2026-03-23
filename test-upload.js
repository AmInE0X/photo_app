// No imports needed

async function testUpload() {
  const formData = new FormData();
  
  // Create a dummy text file to act as an image for testing
  const dummyFileContent = Buffer.from('dummy image data');
  const fileBlob = new Blob([dummyFileContent], { type: 'image/jpeg' });
  
  formData.append('file', fileBlob, 'test.jpg');
  formData.append('title', 'Test Upload');
  formData.append('tags', 'test, debug');
  formData.append('location', 'Localhost');

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
