const express = require("express");
const router = express.Router();
const { getPuntosAcopio } = require("../controllers/acopioController");

router.get("/acopio", getPuntosAcopio);

module.exports = router;