const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [50, 'Room name must not exceed 50 characters'],
  },
  roomId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  password: {
    type: String,
    required: [true, 'Room password is required'],
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatarColor: String,
    joinedAt: { type: Date, default: Date.now },
    socketId: String,
  }],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 20,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
roomSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

roomSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Room', roomSchema);
