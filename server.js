const express = require("express");
const app = express();
const dotenv = require("dotenv");

// Read the ENV file using the DOTENV package
dotenv.config();

// Run the server
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running in ${port}`));