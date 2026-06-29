const {
    testConnection,
    classifyWaste
} = require("../services/geminiService");
const supabase = require("../config/supabase");
async function testGemini(req, res) {
    try {
        const respuesta = await testConnection();

        res.status(200).json({
            success: true,
            message: respuesta
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

async function classifyImage(req, res) {

    console.log(req.file);

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No se recibió ninguna imagen."
        });
    }

    // Obtener la extensión del archivo
    const extension = req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();

    // Extensiones permitidas
    const permitidas = ["jpg", "jpeg", "png", "webp"];

    // Validar formato
    if (!permitidas.includes(extension)) {
        return res.status(400).json({
            success: false,
            message: "Formato no permitido."
        });
    }

    try {
        const mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;

        // 1. Mandamos la imagen a Gemini
        const resultadoGemini = await classifyWaste(
            req.file.buffer,
            mimeType
        );

        // 2. Buscamos el material detectado en nuestra base de datos (Supabase)
        let detallesMaterial = null;
        let datosUsuario = null; // Guardará cómo quedó tu perfil después de reciclar

        if (resultadoGemini.material && resultadoGemini.material !== "Otro") {
            const { data: materialData, error: materialError } = await supabase
                .from("materiales")
                .select("*")
                .ilike("material", resultadoGemini.material)
                .single();

            if (materialError && materialError.code !== 'PGRST116') {
                console.error("Error consultando Supabase:", materialError);
            }

            if (materialData) {
                detallesMaterial = materialData;

                // --- 🧠 LA MAGIA DEL BACKEND: FASE 2 ---
                
                // Vamos haciendo login :p
                const usuarioId = req.body.usuarioId ? parseInt(req.body.usuarioId) : 1; 

                // A. Guardamos el registro en el historial (Tabla reciclajes)
                await supabase
                    .from("reciclajes")
                    .insert([
                        { usuario_id: usuarioId, material_id: detallesMaterial.id }
                    ]);

                // B. Actualizamos la XP y el nivel del usuario
                // Primero vemos cuánta XP tiene ahora
                const { data: userCurrent } = await supabase
                    .from("usuarios")
                    .select("xp, nivel")
                    .eq("id", usuarioId)
                    .single();
                
                if (userCurrent) {
                    const nuevaXp = userCurrent.xp + detallesMaterial.xp;
                    
                    // Lógica de gamificación rápida: cada 50 puntos sube un nivel
                    const nuevoNivel = Math.floor(nuevaXp / 50) + 1; 

                    // Actualizamos la base de datos y pedimos que nos devuelva el usuario actualizado
                    const { data: userUpdated } = await supabase
                        .from("usuarios")
                        .update({ xp: nuevaXp, nivel: nuevoNivel })
                        .eq("id", usuarioId)
                        .select()
                        .single();
                    
                    datosUsuario = userUpdated;
                }
                // ----------------------------------------
            }
        }

        // 3. Juntamos TODO para que el frontend haga un festival visual
        const respuestaFinal = {
            identificacion: resultadoGemini,
            datos_reciclaje: detallesMaterial || { mensaje: "No hay datos específicos para este material." },
            perfil_actualizado: datosUsuario || { mensaje: "No se actualizó el perfil." }
        };

        // 4. Enviamos al frontend
        res.status(200).json({
            success: true,
            resultado: respuestaFinal
        });

    } catch (error) {
        console.error("Error completo en classifyImage:", error);
        res.status(500).json({
            success: false,
            message: "Error al analizar la imagen o consultar la base de datos."
        });
    }
}

module.exports = {
    testGemini,
    classifyImage
};