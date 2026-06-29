const supabase = require("../config/supabase");

async function getUserStats(req, res) {
    const { usuarioId } = req.params;

    try {
        // 1. Buscamos el perfil básico del usuario (XP, nivel, racha)
        const { data: usuario, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", usuarioId)
            .single();

        if (userError) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        // 2. Traemos todos los reciclajes de este usuario junto con los datos de impacto del material
        const { data: reciclajes, error: recError } = await supabase
            .from("reciclajes")
            .select(`
                id,
                materiales (
                    co2,
                    agua
                )
            `)
            .eq("usuario_id", usuarioId);

        if (recError) {
            throw recError;
        }

        // 3. Calculamos los totales (Algoritmo de Impacto Ambiental RF-08)
        let totalCo2Ahorrado = 0;
        let totalAguaAhorrada = 0;
        const totalItemsReciclados = reciclajes.length;

        reciclajes.forEach(item => {
            if (item.materiales) {
                totalCo2Ahorrado += item.materiales.co2;
                totalAguaAhorrada += item.materiales.agua;
            }
        });

        // 4. Devolvemos una respuesta súper completa para el frontend
        res.status(200).json({
            success: true,
            perfil: {
                email: usuario.email,
                xp: usuario.xp,
                nivel: usuario.nivel,
                racha: usuario.racha
            },
            impacto_ambiental: {
                items_reciclados: totalItemsReciclados,
                co2_evitado_g: totalCo2Ahorrado, // en gramos, por ejemplo
                agua_ahorrada_l: totalAguaAhorrada // en litros
            }
        });

    } catch (error) {
        console.error("Error en getUserStats:", error);
        res.status(500).json({
            success: false,
            message: "Error al calcular las estadísticas de impacto."
        });
    }
}

module.exports = {
    getUserStats
};