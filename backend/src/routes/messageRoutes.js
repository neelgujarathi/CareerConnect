const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/message.model");
const User = require("../models/user.model");

router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, jobId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = await Message.create({ senderId, receiverId, jobId, content });
    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/messages/conversation", async (req, res) => {
  try {
    const { user1, user2, jobId } = req.query;

    if (
      !user1 ||
      !user2 ||
      user1 === "undefined" ||
      user2 === "undefined"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing user IDs" });
    }

    const senderObjectId = new mongoose.Types.ObjectId(user1);
    const receiverObjectId = new mongoose.Types.ObjectId(user2);

    const filter = {
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId },
      ],
    };
    if (jobId) filter.jobId = jobId;

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role");

    res.json(messages);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/messages/read", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking read:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
