const supabase = require("../config/supabase");

async function getUserHistory(req, res) {
    const { usuarioId } = req.params;

    try {
        // Buscamos los últimos 10 reciclajes del usuario, ordenados por fecha (más recientes primero)
        const { data, error } = await supabase
            .from("reciclajes")
            .select(`
                id,
                fecha,
                materiales (
                    material,
                    contenedor,
                    xp
                )
            `)
            .eq("usuario_id", usuarioId)
            .order("fecha", { ascending: false })
            .limit(10);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            historial: data
        });

    } catch (error) {
        console.error("Error en getUserHistory:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial."
        });
    }
}

module.exports = {
    getUserHistory
};