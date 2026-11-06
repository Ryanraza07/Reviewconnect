import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';

const serverEnvPath = fileURLToPath(new URL('../.env', import.meta.url));
dotenv.config({ path: serverEnvPath });

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reviewconnect';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('MongoDB unavailable. Continuing with demo in-memory data.');
    console.warn(error.message);
    return false;
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;
