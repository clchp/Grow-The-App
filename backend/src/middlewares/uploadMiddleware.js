const multer = require("multer");

// Guardaremos la imagen en memoria
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Máximo 5 MB
    }
});

module.exports = upload;