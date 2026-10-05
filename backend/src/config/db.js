import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(__dirname, '../../data');
export const DB_FILE = path.join(DATA_DIR, 'db.json');

let isMongoConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/daytrack';
  
  try {
    // Attempt connecting to MongoDB with a short timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at:', mongoUri);
  } catch (err) {
    isMongoConnected = false;
    console.log('ℹ️  MongoDB not reachable (' + err.message + ').');
    console.log('⚡ Activating DayTrack High-Performance Embedded JSON Store in:', DB_FILE);
    ensureLocalDb();
  }

  return { isMongo: isMongoConnected };
}

export function isMongo() {
  return isMongoConnected;
}

export function ensureLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      tasks: [],
      occurrences: [],
      categories: [
        { id: 'cat-coding', name: 'Coding', icon: '💻', color: 'indigo' },
        { id: 'cat-study', name: 'Study', icon: '📚', color: 'blue' },
        { id: 'cat-health', name: 'Health', icon: '🏃', color: 'emerald' },
        { id: 'cat-reading', name: 'Reading', icon: '📖', color: 'amber' },
        { id: 'cat-work', name: 'Work', icon: '💼', color: 'slate' },
        { id: 'cat-personal', name: 'Personal', icon: '🎯', color: 'purple' },
        { id: 'cat-learning', name: 'Learning', icon: '🧠', color: 'teal' }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}
