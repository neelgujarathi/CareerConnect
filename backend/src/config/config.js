const mongoose = require('mongoose');

const connection = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://neelgujarathi66_db_user:svCrxKMTijsnFdAn@cluster0.hhdjo35.mongodb.net/indeedDb?retryWrites=true&w=majority'
    );
    console.log('✅ MongoDB connected successfully...');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connection;
