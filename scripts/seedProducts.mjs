import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

const CREDENTIAL_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve('./ultroninov-a6a1e-firebase-adminsdk-fbsvc-2daefcb6e4.json');

if (!fs.existsSync(CREDENTIAL_PATH)) {
  console.error('Service account JSON not found at:', CREDENTIAL_PATH);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIAL_PATH, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();

// Seed products derived from your current mock data (adjust as needed)
const products = [
  {
    name: 'Arduino Kit Offer (Freshers)',
    price: 1249,
    originalPrice: 1499,
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=300&fit=crop&crop=center&q=80',
    description: "Special starter kit for freshers. Apply promo code FRESHERS2025 to get ₹1249 price. Includes ebook for building projects, 24/7 customer & project support, and Free Soldering Anytime.",
    category: 'Kits',
    inStock: true,
    rating: 4.9,
    reviews: 312,
    isNew: true,
    isFeatured: true,
    images: [],
    boxContents: ['Arduino Uno', 'Breadboard', 'Jumper Wires', 'LEDs', 'Resistors'],
    warranty: '6 months',
    fixedId: '13'
  },
  { name: 'Arduino Uno R3', price: 350, originalPrice: 1099, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: 'Microcontroller board based on the ATmega328P', category: 'Microcontrollers', inStock: true, rating: 4.8, reviews: 1247, isFeatured: true, fixedId: '1' },
  { name: 'Motor Driver L298N', price: 150, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: 'Dual H-Bridge Motor Driver', category: 'Motor Drivers', inStock: true, rating: 4.6, reviews: 892, fixedId: '2' },
  { name: 'Breadboard 830 Point', price: 120, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: 'Solderless breadboard with power rails', category: 'Prototyping', inStock: true, rating: 4.7, reviews: 1563, fixedId: '3' },
  { name: 'Raspberry Pi 4B 8GB', price: 3050, originalPrice: 10999, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: 'ARM Cortex-A72 SBC with 8GB RAM', category: 'Single Board Computers', inStock: false, rating: 4.9, reviews: 2341, isNew: true, fixedId: '4' },
  { name: 'Servo Motor SG90', price: 100, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: 'Micro servo motor 180°', category: 'Motors', inStock: true, rating: 4.5, reviews: 678, fixedId: '5' },
  { name: 'ESP32 DevKit V1', price: 200, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: 'WiFi+BT microcontroller dual-core', category: 'Microcontrollers', inStock: true, rating: 4.7, reviews: 945, isFeatured: true, fixedId: '6' },
  { name: 'LED Strip WS2812B', price: 180, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: 'Addressable RGB LED strip', category: 'LEDs', inStock: true, rating: 4.4, reviews: 523, fixedId: '7' },
  { name: 'Relay Module 5V', price: 130, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: '5V relay module', category: 'Relays', inStock: true, rating: 4.3, reviews: 456, fixedId: '8' },
  { name: 'Arduino Nano', price: 250, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: 'Compact Arduino board', category: 'Microcontrollers', inStock: true, rating: 4.6, reviews: 789, fixedId: '9' },
  { name: 'Stepper Motor 28BYJ-48', price: 170, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: 'Stepper motor with ULN2003 driver', category: 'Motors', inStock: true, rating: 4.4, reviews: 634, fixedId: '10' },
  { name: 'Jumper Wires Set', price: 110, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center&q=80', description: '40-piece jumper wire set', category: 'Prototyping', inStock: true, rating: 4.8, reviews: 1123, fixedId: '11' },
  { name: 'NodeMCU ESP8266', price: 180, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=300&fit=crop&crop=center&q=80', description: 'WiFi-enabled ESP8266 dev board', category: 'Microcontrollers', inStock: true, rating: 4.7, reviews: 856, isNew: true, fixedId: '12' },
];

async function seed() {
  console.log('Seeding products...');
  for (const p of products) {
    // Use fixedId as document id for consistency
    const ref = db.collection('products').doc(p.fixedId);
    await ref.set({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || null,
      image: p.image,
      description: p.description,
      category: p.category,
      inStock: p.inStock,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      isNew: !!p.isNew,
      isFeatured: !!p.isFeatured,
      images: p.images || [],
      boxContents: p.boxContents || [],
      warranty: p.warranty || null,
    }, { merge: true });
    console.log('Upserted', p.name);
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });



