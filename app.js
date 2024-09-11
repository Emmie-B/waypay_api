'use strict'
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import indexRouter from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Routes
app.use('/', indexRouter);

// app.get('/', (req, res) => {
//     res.send('hello world')
//   })

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((client) => {
     
      console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
