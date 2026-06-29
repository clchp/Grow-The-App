const supabase = require("../config/supabase"); 

// Fórmula matemática de Haversine para calcular distancia en Kilómetros
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Devuelve la distancia en KM
}

async function getPuntosAcopio(req, res) {
    // El frontend nos enviará la latitud y longitud por la URL (Query Parameters)
    const { lat, lng } = req.query;

    try {
        // 1. Jalamos todos los puntos de Supabase
        const { data: puntos, error } = await supabase
            .from("puntos_acopio")
            .select("*");

        if (error) throw error;

        // 2. Si el frontend NO mandó ubicación, devolvemos todos los puntos como antes
        if (!lat || !lng) {
            return res.status(200).json({
                success: true,
                modo: "lista_completa",
                cantidad: puntos.length,
                data: puntos
            });
        }

        // 3. Si SÍ mandó ubicación, calculamos la distancia para cada punto
        const usuarioLat = parseFloat(lat);
        const usuarioLng = parseFloat(lng);

        const puntosConDistancia = puntos.map(punto => {
            const distancia = calcularDistancia(usuarioLat, usuarioLng, parseFloat(punto.lat), parseFloat(punto.lng));
            return {
                ...punto,
                distancia_km: parseFloat(distancia.toFixed(2)) // Redondeado a 2 decimales
            };
        });

        // 4. Ordenamos de menor a mayor distancia y nos quedamos solo con los 3 más cercanos (.slice(0, 3))
        const recomendados = puntosConDistancia
            .sort((a, b) => a.distancia_km - b.distancia_km)
            .slice(0, 3);

        res.status(200).json({
            success: true,
            modo: "recomendacion_cercana",
            cantidad: recomendados.length,
            data: recomendados
        });

    } catch (error) {
        console.error("Error en recomendador de acopio:", error.message);
        res.status(500).json({
            success: false,
            message: "Error al procesar los puntos de acopio."
        });
    }
}

module.exports = { getPuntosAcopio };