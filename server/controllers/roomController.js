const Room = require('../models/Room');

// GET /api/rooms - list rooms user is host of or participated in
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true })
      .populate('host', 'username avatarColor')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rooms - create a new private room
const createRoom = async (req, res) => {
  try {
    const { name, password, maxParticipants } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: 'Room name and password are required' });
    }

    const room = await Room.create({
      name,
      password,
      host: req.user._id,
      maxParticipants: maxParticipants || 10,
    });

    const populated = await Room.findById(room._id)
      .populate('host', 'username avatarColor')
      .select('-password');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/rooms/:roomId - get room info (no password)
const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true })
      .populate('host', 'username avatarColor')
      .select('-password');

    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rooms/:roomId/verify - verify room password
const verifyRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const isMatch = await room.comparePassword(req.body.password);
    if (!isMatch) return res.status(403).json({ message: 'Incorrect room password' });

    const safeRoom = await Room.findById(room._id)
      .populate('host', 'username avatarColor')
      .select('-password');

    res.json({ success: true, room: safeRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/rooms/:roomId - delete room (host only)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can delete this room' });
    }

    room.isActive = false;
    await room.save();
    res.json({ message: 'Room closed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRooms, createRoom, getRoom, verifyRoom, deleteRoom };
