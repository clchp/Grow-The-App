const supabase = require("../config/supabase");

/**
 * Actualiza la XP, el Nivel y la Racha diaria del usuario de forma unificada.
 */
async function actualizarProgresoUsuario(usuarioId, xpGanada) {
    try {
        // 1. Traer datos actuales del usuario
        const { data: usuario, error: errorUser } = await supabase
            .from("usuarios")
            .select("xp, nivel, racha, ultima_actividad")
            .eq("id", usuarioId)
            .single();

        if (errorUser || !usuario) throw new Error("Usuario no encontrado");

        // A. CALCULAR NUEVA XP Y NIVEL
        const xpActual = usuario.xp || 0;
        const nuevaXp = xpActual + xpGanada;
        const nuevoNivel = Math.floor(nuevaXp / 100) + 1; // Cada 100 XP sube un nivel

        // B. CALCULAR LA RACHA DIARIA
        let nuevaRacha = usuario.racha || 0;
        
        const hoyStr = new Date().toISOString().split('T')[0]; // Ejemplo: "2026-06-29"
        const ultimaActividadStr = usuario.ultima_actividad;

        if (!ultimaActividadStr) {
            // Primera acción de su vida
            nuevaRacha = 1;
        } else {
            const hoy = new Date(hoyStr);
            const ultimaActividad = new Date(ultimaActividadStr);
            
            // Diferencia en milisegundos convertida a días
            const diferenciaDias = Math.floor((hoy - ultimaActividad) / (1000 * 60 * 60 * 24));

            if (diferenciaDias === 1) {
                // Hizo algo ayer, ¡mantiene y suma la racha!
                nuevaRacha += 1;
            } else if (diferenciaDias > 1) {
                // Pasaron 2 días o más, perdió la racha, vuelve a empezar en 1
                nuevaRacha = 1;
            }
            // Si la diferencia es 0 (ya hizo algo hoy), la racha se queda igual.
        }

        // 2. Guardar todo masticado en la Base de Datos
        const { data: usuarioActualizado, error: errorUpdate } = await supabase
            .from("usuarios")
            .update({
                xp: nuevaXp,
                nivel: nuevoNivel,
                racha: nuevaRacha,
                ultima_actividad: hoyStr
            })
            .eq("id", usuarioId)
            .select()
            .single();

        if (errorUpdate) throw errorUpdate;

        return usuarioActualizado;

    } catch (error) {
        console.error("Error en el helper de gamificación:", error.message);
        return null;
    }
}

module.exports = { actualizarProgresoUsuario };