const mongoose = require("mongoose");
const config = require("config")

// Make connection to MongoDB
const connectToMongoDB = async () => {
    try {
      mongoose.connect(config.get("db"), {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
  
      console.log("Connected to MongoDB...");
    } catch (err) {
      console.error(err.message);
      // Terminate the application
      process.exit(1);
    }
  };
  
  module.exports = connectToMongoDB;