const router = require("express").Router();

const { Note } = require("../models");

// middleware to not repeat the same code for finding a single ntoe
const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id);
  if (!req.note) {
    return res.status(404).end();
  }
  next();
};

router.get("/", async (req, res) => {
  const notes = await Note.findAll();
  console.log(JSON.stringify(notes, null, 2));
  res.json(notes);
});

router.get("/:id", noteFinder, async (req, res) => {
  const note = req.note;
  if (note) {
    console.log(note.toJSON());
    res.json(note);
  } else {
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const note = await Note.create({ ...req.body, date: new Date() });
    res.json(note);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
  const note = req.note;
  if (note) {
    await note.destroy();
  }
  res.status(204).end();
});

router.put("/:id", async (req, res) => {
  const note = req.note;
  if (note) {
    note.important = req.body.important;
    await note.save();
    res.json(note);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
