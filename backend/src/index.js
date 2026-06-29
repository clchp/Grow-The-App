require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./config/supabase");

const classifyRoutes = require("./routes/classifyRoutes");
const statsRoutes = require("./routes/statsRoutes");
const historialRoutes = require("./routes/historialRoutes");
const chatRoutes = require("./routes/chatRoutes");
const acopioRoutes = require("./routes/acopioRoutes");
const habitoRoutes = require("./routes/habitoRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", classifyRoutes);
app.use("/api", statsRoutes);
app.use("/api", historialRoutes)
app.use("/api", chatRoutes);
app.use("/api", acopioRoutes);
app.use("/api", habitoRoutes);

const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("🌱 Grow Backend funcionando correctamente");
});
app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "Grow Backend",
        status: "Running"
    });
});

//Prueba de base de datos
app.get("/api/materiales", async (req, res) => {
    try {
        // Le pedimos a Supabase TODOS los registros de la tabla "materiales"
        const { data, error } = await supabase.from("materiales").select("*");

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            mensaje: "¡Conexión exitosa a Supabase!",
            materiales: data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});