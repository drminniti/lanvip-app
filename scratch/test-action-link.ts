import { getAdminAuth } from '../src/lib/firebase-admin';

async function test() {
  const auth = getAdminAuth();
  const email = 'damian.nutriarte@gmail.com';
  try {
    const link = await auth.generateEmailVerificationLink(email);
    console.log('Original Link:', link);
    
    // How to replace it:
    const url = new URL(link);
    const customLink = `http://localhost:3000/action${url.search}`;
    console.log('Custom Link:', customLink);
  } catch (e) {
    console.error(e);
  }
}

test();
