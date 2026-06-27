const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: { type: String, required: true },
  senderColor: { type: String, default: '#6C63FF' },
  text: {
    type: String,
    required: true,
    maxlength: [1000, 'Message too long'],
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
