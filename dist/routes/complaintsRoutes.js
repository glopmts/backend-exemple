const express = require("express");
const router = express.Router();
const {
  createComplimentHandlerUser,
} = require("../controllers/index.controller");

router.post("/complaints", createComplimentHandlerUser);

module.exports = router;
