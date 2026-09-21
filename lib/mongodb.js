import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define MONGODB_URI in .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose =
    {
      conn: null,
      promise: null,
    };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise =
      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
  }

  try {
    cached.conn =
      await cached.promise;
  } catch (error) {
    cached.promise = null;

    console.error(
      "MONGODB CONNECTION ERROR:",
      error.message
    );

    throw error;
  }

  return cached.conn;
}

export default connectDB;