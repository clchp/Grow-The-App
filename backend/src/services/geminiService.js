const { GoogleGenAI } = require("@google/genai");

console.log(process.env.GEMINI_API_KEY);

// Crear cliente de Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Función para probar la conexión
async function testConnection() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Responde únicamente con: Hola Grow 🌱",
        });

        return response.text;
    } catch (error) {
        console.error("Error conectando con Gemini:", error.message);
        throw error;
    }
}

async function classifyWaste(imageBuffer, mimeType) {

    const base64Image = imageBuffer.toString("base64");

    const prompt = `
                    Eres un experto en clasificación de residuos para reciclaje.

                    Analiza la imagen y responde ÚNICAMENTE un JSON válido.

                    Debes identificar únicamente:

                    {
                    "material": "",
                    "tipo": "",
                    "reciclable": true
                    }

                    Reglas:

                    - "material" debe ser uno de:
                    - Plástico
                    - Papel
                    - Cartón
                    - Vidrio
                    - Metal
                    - Orgánico
                    - Electrónico
                    - Textil
                    - Otro

                    - "tipo" debe ser el nombre específico del objeto observado.
                    Ejemplos:
                    "Botella PET"
                    "Lata de aluminio"
                    "Caja de cartón"
                    "Periódico"
                    "Botella de vidrio"

                    - "reciclable" debe ser true o false.

                    No escribas explicaciones.
                    No uses markdown.
                    No pongas \`\`\`.
                    Responde únicamente el JSON.
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ]
    });

    let resultado = response.text.trim();

    // Si Gemini responde con ```json ... ```
    if (resultado.startsWith("```")) {

        resultado = resultado
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

    }

    // Convertimos el texto a un objeto JSON
    return JSON.parse(resultado);

}

async function askEcoAssistant(preguntaUsuario) {
    const systemPrompt = `
    Eres "GrowBot", un asistente virtual experto en ecología, reciclaje y sostenibilidad para la aplicación Grow.
    Tu objetivo es responder dudas de los usuarios de forma amigable, concisa (máximo 3 párrafos) y motivadora.
    Usa emojis relacionados con la naturaleza. Si te preguntan algo que no tiene nada que ver con reciclaje, 
    medio ambiente o ecología, responde amablemente que solo estás entrenado para salvar al planeta y 
    redirige la conversación al reciclaje.
    `;

    // Usamos tu variable 'ai' (la versión nueva del SDK)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\n\nPregunta del usuario: ${preguntaUsuario}`,
    });

    return response.text;
}

module.exports = {
    testConnection,
    classifyWaste,
    askEcoAssistant
};