import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Connect to the in-memory database.
 */
export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close(true); // Force close
    }
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true, force: true });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error closing database:', error);
    if (mongoServer) {
      try {
        await mongoServer.stop({ force: true });
      } catch (e) {
        
      }
    }
  }
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};
