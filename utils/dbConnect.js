const mongoose = require("mongoose");

const dbConnectionFunction = async () => {
  try {
    const dbObject = await mongoose.connect(process.env.MONGODB);
    if (dbObject) {
      console.log(`DB connection estbalished`);
    } else {
      console.log(`Failed to establish DB Connection`);
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = { dbConnectionFunction };
