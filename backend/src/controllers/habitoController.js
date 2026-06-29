const supabase = require("../config/supabase");
const { actualizarProgresoUsuario } = require("../utils/gamification");

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

        // 🔥 C. USAMOS EL HELPER: Actualiza XP, Nivel y Racha en un solo paso
        const datosUsuario = await actualizarProgresoUsuario(usuarioId, habito.puntos);

        let perfilStatus = "No se pudo actualizar el perfil automáticamente.";
        let nivelActual = 1;

        if (datosUsuario) {
            nivelActual = datosUsuario.nivel;
            perfilStatus = `¡Ganaste ${habito.puntos} XP! Total: ${datosUsuario.xp} XP (Nivel ${datosUsuario.nivel}, Racha: ${datosUsuario.racha} días).`;
        }

        res.status(200).json({
            success: true,
            message: `¡Hábito '${habito.nombre}' registrado con éxito!`,
            puntos_ganados: habito.puntos,
            nivel_actual: nivelActual,
            perfil_status: perfilStatus,
            perfil_completo: datosUsuario // Le mandamos todo a Dafne para que actualice la app
        });

    } catch (error) {
        console.error("Error al completar hábito:", error.message);
        res.status(500).json({ success: false, message: "Error interno al procesar el hábito." });
    }
}

// 3. Obtener el historial de hábitos de un usuario específico
async function getHistorialHabitos(req, res) {
    const { usuarioId } = req.params;

    try {
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
            .order("completado_at", { ascending: false })
            .limit(10);

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