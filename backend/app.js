const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const connection = require("./src/config/config.js");
const { Server } = require("socket.io");

const jobRoutes = require("./src/routes/jobRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes.js");
const userregister = require("./src/routes/registerRoutes.js");
const authRoutes = require("./src/routes/authRoutes.js");
const dashboardRoutes = require("./src/routes/dashboardRoutes.js");
const aiRoutes = require("./src/routes/aiRoutes.js");
const messageRoutes = require("./src/routes/messageRoutes.js");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---------------- SOCKET.IO REAL-TIME NOTIFICATION ----------------
const onlineUsers = {}; 

io.on("connection", (socket) => {

  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("sendNotification", (data) => {
    if (data.to && onlineUsers[data.to]) {
      io.to(onlineUsers[data.to]).emit("receiveNotification", data);
    } else {
      io.emit("receiveNotification", data);
    }
  });

  socket.on("disconnect", () => {
    for (let id in onlineUsers) {
      if (onlineUsers[id] === socket.id) delete onlineUsers[id];
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

app.set("io", io);

app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", userregister);
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", messageRoutes);

app.get("/api/test", (req, res) => res.json({ message: "API working ✅" }));

app.get("/", (req, res) => res.send("🚀 Job Portal Backend Running Successfully!"));

connection();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
