const mongoose = require("mongoose");


// Make connection to MongoDB
const connectToMongoDB = async () => {
    try {
      mongoose.connect(process.env.DB, {
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