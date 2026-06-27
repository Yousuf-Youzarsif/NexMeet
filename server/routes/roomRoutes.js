const express = require('express');
const router = express.Router();
const { getRooms, createRoom, getRoom, verifyRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.get('/:roomId', protect, getRoom);
router.post('/:roomId/verify', protect, verifyRoom);
router.delete('/:roomId', protect, deleteRoom);

module.exports = router;
