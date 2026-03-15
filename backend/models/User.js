const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  phone:          { type: String, required: true },
  password:       { type: String, required: true },
  profilePicture: { type: String, default: null },
  roleId:         { type: Schema.Types.ObjectId, ref: 'Role', required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
