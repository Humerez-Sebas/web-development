const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'book-library-app-49efa'
});

const db = admin.firestore();

console.log('🔄 Intentando conectar con Firebase...');

db.collection('test').doc('testDoc').set({
  message: '¡Firebase está funcionando correctamente!',
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
  testDate: new Date().toISOString()
})
.then(() => {
  console.log('✅ ¡ÉXITO! Firebase conectado correctamente');
  console.log('✅ Se creó un documento de prueba en Firestore');
  console.log('\n📍 Puedes verlo en: https://console.firebase.google.com/project/book-library-app-49efa/firestore');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ ERROR al conectar con Firebase:');
  console.error(error.message);
  console.error('\n💡 Detalles completos del error:');
  console.error(error);
  process.exit(1);
});