const supabase = require("../config/supabase");
const { askEcoAssistant } = require("../services/geminiService");

async function handleChat(req, res) {
    // 💡 Ahora recibimos el usuarioId para saber quién le está hablando a la mascota
    const { mensaje, usuarioId } = req.body;

    if (!mensaje) {
        return res.status(400).json({ success: false, message: "El mensaje es requerido." });
    }

    try {
        // Buscamos rápido el perfil en Supabase. Si no viene un ID, por defecto usamos el 1.
        const idParaBuscar = usuarioId ? parseInt(usuarioId) : 1;
        const { data: usuario } = await supabase
            .from("usuarios")
            .select("nivel, racha")
            .eq("id", idParaBuscar)
            .single();

        const nivel = usuario ? usuario.nivel : 1;
        const racha = usuario ? usuario.racha : 0;

        // Le enviamos a tu servicio el mensaje junto con el nivel y racha reales
        const respuestaIA = await askEcoAssistant(mensaje, nivel, racha);
        
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