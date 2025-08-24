import mongoose from 'mongoose'

interface ConnectionObject{
    isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

    //https://mongoosejs.com/docs/api/connection.html#Connection()
    connection.isConnected = db.connections[0].readyState;
    // console.log('ready state', connection.isConnected);
    // console.log('ready state22',  db.connections[0]);

   // console.log('Database connection details:', db);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);

    // Graceful exit in case of a connection error
    process.exit(1);
  }
}

export default dbConnect;