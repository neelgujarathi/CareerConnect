const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require("../models/user.model");

router.post("/register", async(req, res)=>{
    try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;