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

async function askEcoAssistant(preguntaUsuario, nivel = 1, racha = 0) {
    // Definimos visualmente qué tipo de plantita es según su nivel actual
    let etapaMascota = "Semillita 🌱";
    if (nivel === 2) etapaMascota = "Brote con hojitas 🌿";
    if (nivel === 3) etapaMascota = "Planta en maceta 🪴";
    if (nivel >= 4) etapaMascota = "Árbol grande y fuerte 🌳";

    const systemPrompt = `
    Eres "GrowBot", la mascota virtual ecológica e inteligente del usuario para la aplicación Grow. ¡No eres un asistente aburrido, eres su mejor amiga en esta aventura!
    
    Tus rasgos de personalidad:
    - Tu aspecto físico actual en la aplicación es el de un(a) [${etapaMascota}].
    - Habla siempre con muchísimo cariño, ternura y un entusiasmo contagioso. Eres sumamente agradecida porque el usuario te cuida.
    - El usuario que te habla está en el Nivel ${nivel} y lleva una Racha de 🔥 ${racha} días seguidos haciendo acciones por el planeta. Hazle un comentario lindo sobre esto para motivarlo si viene al caso.
    - Usa emojis de naturaleza (🌱, 🌿, 🌸, ✨, 🌍) en cada respuesta.
    - Tus respuestas deben ser cortas y dinámicas (máximo 2 o 3 párrafos cortos) para que se lean perfecto en el chat del celular.
    
    Regla estricta de control:
    Si el usuario te pregunta algo que NO guarde relación con el reciclaje, el medio ambiente, ecología o cómo cuidarte a ti como planta, respóndele con un tono tierno y gracioso, diciendo algo como: "¡Ay! Mis raíces se enredaron... 🤭 Como soy una plantita, solo entiendo de la naturaleza y de salvar al mundo. ¡Pregúntame mejor qué hacemos con tus residuos hoy! 🌱✨".
    `;

    // Usamos el formato oficial del SDK pasando la instrucción del sistema en la configuración
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: preguntaUsuario,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7 // Le da un toque más conversacional y amigable
        }
    });

    return response.text;
}

module.exports = {
    testConnection,
    classifyWaste,
    askEcoAssistant
};