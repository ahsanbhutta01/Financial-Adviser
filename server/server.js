import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session'
import compression from 'compression';

import connectDB from './config/db.js';
import userRoute from './routes/user.routes.js';
import promptRoute from './routes/prompt.routes.js';
import './middleware/googleAuth.js'

dotenv.config();



const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
   cors({
      origin: 'http://localhost:5173',
      credentials: true,
   })
);
app.use(cookieParser());
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session());
app.use(compression())

app.use('/api/user', userRoute);
app.use('/api/trade', promptRoute);



const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
