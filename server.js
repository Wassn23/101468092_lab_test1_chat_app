const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb+srv://wassn_db_user:3LmyhuOw5jzOkMom@labtest1.ipw3ot8.mongodb.net/chatapp?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test Route
app.get("/", (req, res) => {
  res.send("Chat App Server Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
