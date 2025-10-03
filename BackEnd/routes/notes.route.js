const express = require('express');
const Note = require('../models/notes.model');
const auth = require('../middleware/auth');
const cors = require('cors');

const router = express.Router();
router.use(cors());

// ------------------------
// Add a new note
// ------------------------
router.post('/add', auth, async (req, res) => {
  const { title, desc, tags = [], priority = 'medium', archived = false, starred = false } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  if (!title?.trim() || !desc?.trim()) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const note = await Note.create({
      title: title.trim(),
      description: desc.trim(),
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
      archived,
      starred,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: "Note added successfully",
      note
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message || "Error adding the note" });
  }
});

// ------------------------
// Fetch all notes for logged-in user
// ------------------------
router.get('/fetch', auth, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  try {
    const notes = await Note.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching the notes" });
  }
});

// ------------------------
// Delete a note by ID
// ------------------------
router.delete('/delete/:id', auth, async (req, res) => {
  const { id } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: id, createdBy: req.user.id });

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found or you are not authorized" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting note" });
  }
});

// ------------------------
// Update a note by ID
// ------------------------
router.put('/update/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, desc, tags, priority, archived, starred } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  const updateFields = {};
  if (title) updateFields.title = title.trim();
  if (desc) updateFields.description = desc.trim();
  if (tags) updateFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
  if (priority) updateFields.priority = priority;
  if (archived !== undefined) updateFields.archived = archived;
  if (starred !== undefined) updateFields.starred = starred;

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found or you are not authorized" });
    }

    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating the note" });
  }
});
// GET /notes/share/:publicId
router.get("/share/:publicId", async (req, res) => {
  try {
    const note = await Note.findOne({ publicId: req.params.publicId }).lean();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Return only public info
    res.json({
      title: note.title,
      description: note.description,
      tags: note.tags || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
