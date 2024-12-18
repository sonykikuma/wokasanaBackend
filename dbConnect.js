const mongoose = require("mongoose");

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB);
    if (connection) {
      console.log(`DB connection successfully`);
    } else {
      console.log(` DB Connection failed`);
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = { initializeDatabase };
