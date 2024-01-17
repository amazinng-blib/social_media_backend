const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Global middlewares
app.use(express.json());
app.use(cors());

// Routes
const AuthRoutes = require('./Routes/AuthRoutes');
const UserRoute = require('./Routes/UserRoute');

app.use('/auth', AuthRoutes);
app.use('/user', UserRoute);

// DB

// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then((res) => console.log(`MongoDB Connected: ${res.connection.host}`));

const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`App listening on PORT: ${PORT}`);
// });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Listening at ${PORT}`)))
  .catch((err) => console.log(err));
