const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

const { Note, User } = require("../models/index");

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

router.post("/", tokenExtractor, async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findByPk(req.decodedToken.id);
    const note = await Note.create({
      ...req.body,
      date: new Date(),
      userId: user.id,
    });
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
