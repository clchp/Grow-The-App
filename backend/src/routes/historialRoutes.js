const express = require("express");
const router = express.Router();
const { getUserHistory } = require("../controllers/historialController");

// Ruta para obtener las últimas actividades del usuario
router.get("/historial/:usuarioId", getUserHistory);

module.exports = router;