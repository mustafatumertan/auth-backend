const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectToMongoDB = require("./config/db");

// Accept incoming request
app.use(express.json({ extended: false }));

// Read the ENV file using the DOTENV package
dotenv.config();

// Connect to MongoDB
connectToMongoDB();

// Routes
app.use("/api/auth", require("./routes/api/auth"));

// Run the server
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running in ${port}`));