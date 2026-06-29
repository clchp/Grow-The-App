const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");

const {
    testGemini,
    classifyImage
} = require("../controllers/classifyController");

// Ruta para probar Gemini
router.get("/test-gemini", testGemini);

router.post(
    "/classify",
    upload.single("image"),
    classifyImage
);

module.exports = router;