const cors = require("cors");
const express = require("express");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota básica de teste
app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

app.use("/api", (req, res) => {
  res.json({ message: "API funcionando!" });
});

module.exports = app;
