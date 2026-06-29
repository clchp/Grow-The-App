const { askEcoAssistant } = require("../services/geminiService");

async function handleChat(req, res) {
    const { mensaje } = req.body;

    if (!mensaje) {
        return res.status(400).json({ success: false, message: "El mensaje es requerido." });
    }

    try {
        const respuestaIA = await askEcoAssistant(mensaje);
        res.status(200).json({
            success: true,
            respuesta: respuestaIA
        });
    } catch (error) {
        console.error("Error en el chatbot:", error);
        res.status(500).json({ success: false, message: "Error al procesar la consulta con el asistente." });
    }
}

module.exports = { handleChat };