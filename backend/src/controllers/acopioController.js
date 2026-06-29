// Importamos la conexión a Supabase que creaste al inicio del proyecto
const supabase = require("../config/supabase"); 

async function getPuntosAcopio(req, res) {
    try {
        // Hacemos la consulta a la nueva tabla en la base de datos
        const { data: puntos, error } = await supabase
            .from("puntos_acopio")
            .select("*");

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            cantidad: puntos.length,
            data: puntos
        });
    } catch (error) {
        console.error("Error al obtener puntos de acopio:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al conectar con la base de datos para obtener los puntos de acopio."
        });
    }
}

module.exports = { getPuntosAcopio };