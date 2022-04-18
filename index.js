import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'

 // Initialzing express app instance
const app = express();
dotenv.config()

// Setting up a body parser, cors and other backend tools to properly send requests
app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());

// Setting up routes
// Posts routes
app.use('/posts', postRoutes);
app.use('/user', userRoutes)

app.get('/', (req, res) => {
    res.send("APP is running");
})


// Setting up a connection with MondoDB Cloud Atlas
const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`)))
    .catch((error) => console.log(error.message));
