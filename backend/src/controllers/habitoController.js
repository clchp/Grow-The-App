const supabase = require("../config/supabase");

// 1. Obtener todos los hábitos disponibles para el checklist
async function getHabitos(req, res) {
    try {
        const { data: habitos, error } = await supabase
            .from("habitos")
            .select("*");

        if (error) throw error;

        res.status(200).json({ success: true, data: habitos });
    } catch (error) {
        console.error("Error al obtener hábitos:", error.message);
        res.status(500).json({ success: false, message: "Error al obtener los hábitos." });
    }
}

// 2. Marcar un hábito como completado y ganar puntos
async function completarHabito(req, res) {
    const { usuarioId, habitoId } = req.body;

    if (!usuarioId || !habitoId) {
        return res.status(400).json({ success: false, message: "Faltan usuarioId o habitoId." });
    }

    try {
        // A. Buscar cuánto vale ese hábito en puntos
        const { data: habito, error: errorHabito } = await supabase
            .from("habitos")
            .select("puntos, nombre")
            .eq("id", habitoId)
            .single();

        if (errorHabito || !habito) {
            return res.status(404).json({ success: false, message: "Hábito no encontrado." });
        }

        // B. Registrar en el historial que este usuario completó este hábito
        const { error: errorHistorial } = await supabase
            .from("usuario_habitos")
            .insert([{ usuario_id: usuarioId, habito_id: habitoId }]);

        if (errorHistorial) throw errorHistorial;

        // C. Traer los puntos actuales del usuario (Cambiado de 'puntos' a 'xp' para que coincida con tu BD)
        const { data: usuario, error: errorUsuario } = await supabase
            .from("usuarios")
            .select("xp") 
            .eq("id", usuarioId)
            .single();

        let perfilActualizado = "No se pudo actualizar el perfil.";
        let nuevosPuntos = 0;

        // D. Si el usuario existe, le sumamos los puntos ganados a su columna 'xp'
        if (usuario) {
            nuevosPuntos = (usuario.xp || 0) + habito.puntos;
            
            const { error: errorUpdate } = await supabase
                .from("usuarios")
                .update({ xp: nuevosPuntos }) // Actualizamos la columna 'xp'
                .eq("id", usuarioId);

            if (!errorUpdate) {
                perfilActualizado = `¡Puntos actualizados! Total: ${nuevosPuntos} XP.`;
            }
        }

        res.status(200).json({
            success: true,
            message: `¡Hábito '${habito.nombre}' registrado con éxito!`,
            puntos_ganados: habito.puntos,
            perfil_status: perfilActualizado
        });

    } catch (error) {
        console.error("Error al completar hábito:", error.message);
        res.status(500).json({ success: false, message: "Error interno al procesar el hábito." });
    }
}

// 3. Obtener el historial de hábitos de un usuario específico
async function getHistorialHabitos(req, res) {
    const { usuarioId } = req.params; // Lo recibiremos por la URL

    try {
        // Magia de Supabase: Hacemos un "JOIN" con la tabla 'habitos' para traer el nombre
        const { data: historial, error } = await supabase
            .from("usuario_habitos")
            .select(`
                id,
                completado_at,
                habitos (
                    nombre,
                    puntos
                )
            `)
            .eq("usuario_id", usuarioId)
            .order("completado_at", { ascending: false }) // Los más recientes primero
            .limit(10); // Traemos los últimos 10 para no saturar la pantalla

        if (error) throw error;

        res.status(200).json({ 
            success: true, 
            cantidad: historial.length,
            data: historial 
        });
    } catch (error) {
        console.error("Error al obtener el historial de hábitos:", error.message);
        res.status(500).json({ success: false, message: "Error al cargar el historial." });
    }
}

module.exports = { getHabitos, completarHabito, getHistorialHabitos };