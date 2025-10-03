const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const notesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    // unique: true, // removed global unique to allow same title for different users
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to the User model
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  archived: {
    type: Boolean,
    default: false,
  },
  starred: {
    type: Boolean,
    default: false,
  },
  publicId: {
    type: String,
    unique: true,
    default: uuidv4, // generates shareable ID
  },
}, { timestamps: true });

// Optional: create a compound index to enforce title uniqueness per user
notesSchema.index({ title: 1, createdBy: 1 }, { unique: true });

const Note = mongoose.model('Note', notesSchema);
module.exports = Note;
