const express = require("express");
const router = express.Router();
const { getHabitos, completarHabito, getHistorialHabitos } = require("../controllers/habitoController");

router.get("/habitos", getHabitos);
router.post("/habitos/completar", completarHabito);
router.get("/habitos/historial/:usuarioId", getHistorialHabitos);

module.exports = router;