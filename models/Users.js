import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  site: String,
  username: String,
  password: String,
});

export default mongoose.model('Users', UserSchema);
