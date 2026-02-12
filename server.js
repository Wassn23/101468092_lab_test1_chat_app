const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const http = require("http");
const { Server } = require("socket.io");
const GroupMessage = require("./models/GroupMessage");
const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://wassn_db_user:3LmyhuOw5jzOkMom@labtest1.ipw3ot8.mongodb.net/chatapp?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
  
  app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      firstname,
      lastname,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

socket.on("joinRoom", async (room) => {

  socket.join(room);

  const previousMessages = await GroupMessage.find({ room }).sort({ date_sent: 1 });

  socket.emit("loadMessages", previousMessages);

});


socket.on("leaveRoom", (room) => {
  socket.leave(room);
});


 socket.on("sendMessage", async (data) => {

  const newMessage = new GroupMessage({
    from_user: data.username,
    room: data.room,
    message: data.message
  });

  await newMessage.save();

  io.to(data.room).emit("receiveMessage", data);
});


 socket.on("typing", (data) => {
  console.log("Typing received:", data);
  socket.to(data.room).emit("userTyping", data.username);
});

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
