const express = require("express");
const router = express.Router();
const { getUserStats } = require("../controllers/statsController");

// Ruta para obtener las estadísticas de impacto ambiental del usuario
router.get("/stats/:usuarioId", getUserStats);

module.exports = router;