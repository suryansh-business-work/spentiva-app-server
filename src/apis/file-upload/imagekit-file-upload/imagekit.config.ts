import ImageKit from 'imagekit';

// Validate and load ImageKit credentials
const IMAGEKIT_PUBLIC_KEY = 'public_kgj5PULxw6pfjeO2IGwEVundBIQ=';
const IMAGEKIT_PRIVATE_KEY = 'private_V/h/dUfvRAW/n8CxmmQCeB0okPQ=';
const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/esdata1';

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
  console.warn('⚠️  IMAGEKIT_PUBLIC_KEY not found in env, using fallback credentials');
}

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;
