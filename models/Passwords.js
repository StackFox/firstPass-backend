import mongoose from 'mongoose';

const PasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  username: String,
  password: String
});

export default mongoose.model('Passwords', PasswordSchema);