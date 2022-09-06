import mongoose from "mongoose";

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/neuvontajono";

let cachedMongoose = (global as any).mongoose;
let cachedMongo = (global as any).mongo;

if (!cachedMongoose) {
  cachedMongoose = (global as any).mongoose = { conn: null, promise: null };
}

if (!cachedMongo) {
  cachedMongo = (global as any).mongo = { conn: null, promise: null };
}

export async function getMongoClientPromise() {
  const conn = await dbConnect();
  return conn.connection.client;
}

export async function dbConnect() {
  if (cachedMongoose.conn) {
    return cachedMongoose.conn;
  }

  if (!cachedMongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cachedMongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}
