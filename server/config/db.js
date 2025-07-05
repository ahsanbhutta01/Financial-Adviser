import mongoose from 'mongoose';


mongoose.connection.on('connected', () => {
   console.log('Mongoose: Connecting to DB...');
});

mongoose.connection.on('error', (err) => {
   console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
   console.log('Mongoose: Disconnected from DB');
});

const connectDB = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`)
   } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1)
   }

}

export default connectDB;