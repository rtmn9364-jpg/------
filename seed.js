/**
 * Database Seed Script
 * Run with: node config/seed.js
 * Seeds the database with an admin user and sample products
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// ─── Sample Products ──────────────────────────────────────────────────────────
const sampleProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Integrated Processor V1. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging.',
    price: 279.99,
    comparePrice: 349.99,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
    ],
    stock: 45,
    sku: 'SNY-WH1000XM5',
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
    isFeatured: true,
    rating: 4.8,
    numReviews: 234
  },
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    description: 'Active Noise Cancellation that blocks outside noise. Adaptive Transparency lets outside sound in. Personalized Spatial Audio with dynamic head tracking.',
    price: 219.99,
    comparePrice: 249.99,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'
    ],
    stock: 78,
    sku: 'APL-AIRPODS-PRO2',
    tags: ['earbuds', 'wireless', 'apple', 'noise-canceling'],
    isFeatured: true,
    rating: 4.9,
    numReviews: 567
  },
  {
    name: 'Samsung 65" 4K QLED Smart TV',
    description: 'Quantum Dot technology delivers a billion shades of brilliant color. Neo Quantum Processor 4K refines any content to stunning 4K resolution. Anti-Reflection technology reduces glare.',
    price: 1199.99,
    comparePrice: 1499.99,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600'
    ],
    stock: 12,
    sku: 'SAM-65QLED-2024',
    tags: ['tv', 'samsung', '4k', 'smart-tv', 'qled'],
    isFeatured: true,
    rating: 4.7,
    numReviews: 189
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    description: 'Supercharged by M3 Pro chip. Up to 18-hour battery life. Stunning 14.2-inch Liquid Retina XDR display with ProMotion. 18GB unified memory.',
    price: 1999.99,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'
    ],
    stock: 20,
    sku: 'APL-MBP14-M3PRO',
    tags: ['laptop', 'apple', 'macbook', 'm3'],
    isFeatured: false,
    rating: 4.9,
    numReviews: 312
  },
  {
    name: 'Nike Air Max 270 Running Shoes',
    description: 'Inspired by the Air Max 93 and Air Max 180. Max Air unit in the heel for exceptional comfort. Engineered mesh upper for breathability and support.',
    price: 129.99,
    comparePrice: 150.00,
    category: 'Sports',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'
    ],
    stock: 95,
    sku: 'NK-AIRMAX270-BLK',
    tags: ['shoes', 'nike', 'running', 'sneakers'],
    isFeatured: true,
    rating: 4.6,
    numReviews: 445
  },
  {
    name: 'Levi\'s 501 Original Fit Jeans',
    description: 'The original jean since 1873. Sits at the waist. Straight, regular fit through the thigh and leg. Button fly. 100% cotton denim.',
    price: 59.99,
    comparePrice: 79.99,
    category: 'Clothing',
    brand: 'Levi\'s',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'
    ],
    stock: 150,
    sku: 'LVS-501-ORIG-32',
    tags: ['jeans', 'denim', 'levis', 'clothing'],
    isFeatured: false,
    rating: 4.5,
    numReviews: 892
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: '7-in-1 multi-use: Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 6-quart capacity. Over 40 safety features.',
    price: 79.99,
    comparePrice: 99.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600'
    ],
    stock: 67,
    sku: 'IP-DUO-6QT',
    tags: ['kitchen', 'pressure-cooker', 'instant-pot', 'home'],
    isFeatured: true,
    rating: 4.7,
    numReviews: 1234
  },
  {
    name: 'Dyson V15 Detect Absolute Vacuum',
    description: 'Laser detects invisible dust. Automatically adapts suction power across different floor types. HEPA filtration captures particles as small as 0.1 microns.',
    price: 649.99,
    comparePrice: 749.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
    ],
    stock: 30,
    sku: 'DYS-V15-DETECT',
    tags: ['vacuum', 'dyson', 'cordless', 'home'],
    isFeatured: false,
    rating: 4.8,
    numReviews: 678
  },
  {
    name: 'The Psychology of Money - Book',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. Doing well with money isn\'t necessarily about what you know. It\'s about how you behave.',
    price: 18.99,
    category: 'Books',
    brand: 'Harriman House',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'
    ],
    stock: 200,
    sku: 'BK-PSYCHMONEY',
    tags: ['book', 'finance', 'psychology', 'money'],
    isFeatured: false,
    rating: 4.9,
    numReviews: 2341
  },
  {
    name: 'Yoga Mat Premium Non-Slip',
    description: 'Professional grade 6mm thick yoga mat. Non-slip surface for stability. Eco-friendly TPE material. Includes carry strap. Perfect for yoga, pilates, and stretching.',
    price: 45.99,
    category: 'Sports',
    brand: 'YogaFlow',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'
    ],
    stock: 120,
    sku: 'YF-YOGAMAT-PURP',
    tags: ['yoga', 'mat', 'fitness', 'sports'],
    isFeatured: false,
    rating: 4.4,
    numReviews: 567
  },
  {
    name: 'CeraVe Moisturizing Cream',
    description: 'Developed with dermatologists. Contains three essential ceramides to help restore and maintain the skin\'s natural barrier. Non-comedogenic and fragrance-free.',
    price: 14.99,
    comparePrice: 18.99,
    category: 'Beauty',
    brand: 'CeraVe',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'
    ],
    stock: 300,
    sku: 'CV-MOIST-CREAM',
    tags: ['skincare', 'moisturizer', 'cerave', 'beauty'],
    isFeatured: false,
    rating: 4.8,
    numReviews: 4521
  },
  {
    name: 'LEGO Technic Ferrari 488 GTE',
    description: 'Iconic Ferrari replica with detailed V8 engine with moving pistons, working steering, openable doors, and authentic Ferrari red color. 1677 pieces.',
    price: 169.99,
    category: 'Toys',
    brand: 'LEGO',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'
    ],
    stock: 40,
    sku: 'LGO-42125',
    tags: ['lego', 'technic', 'ferrari', 'toys'],
    isFeatured: true,
    rating: 4.9,
    numReviews: 231
  }
];

// ─── Seed function ────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@shop.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin'
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample customer
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Customer123!',
      role: 'customer'
    });
    console.log('✅ Sample customer created: jane@example.com');

    // Create products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${products.length} sample products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────');
    console.log(`Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
    console.log('Customer login: jane@example.com / Customer123!');
    console.log('─────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
