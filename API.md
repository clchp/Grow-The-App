# 🌱 Grow Backend API

**Base URL**

```text
https://calzone-sprinkled-scolding.ngrok-free.dev
```

---

## 🩺 Estado del servidor

### GET /

Verifica que el backend esté funcionando.

**Postman**

- Método: `GET`
- Body: Ninguno

```
https://calzone-sprinkled-scolding.ngrok-free.dev/
```

---

### GET /health

Obtiene el estado del servidor.

**Postman**

- Método: `GET`
- Body: Ninguno

```
https://calzone-sprinkled-scolding.ngrok-free.dev/health
```

---

## 🤖 Clasificación de residuos

### POST /api/classify

Clasifica una imagen utilizando IA y registra el reciclaje del usuario.

**Postman**

- Método: `POST`
- Body → **form-data**

| Key | Tipo | Valor |
|------|------|-------|
| image | File | Seleccionar imagen |
| usuarioId | Text | 2 |

URL

```
https://calzone-sprinkled-scolding.ngrok-free.dev/api/classify
```

---

## 📊 Dashboard

### GET /api/stats/:usuarioId

Obtiene las estadísticas del usuario.

**Ejemplo**

```
GET /api/stats/2
```

---

### GET /api/historial/:usuarioId

Obtiene el historial del usuario.

**Ejemplo**

```
GET /api/historial/2
```

---

## 🌱 Hábitos

### GET /api/habitos

Lista todos los hábitos.

```
GET /api/habitos
```

---

### POST /api/habitos/completar

Marca un hábito como completado.

**Body → raw → JSON**

```json
{
  "usuarioId": 2,
  "habitoId": 1
}
```

---

### GET /api/habitos/historial/:usuarioId

Historial de hábitos del usuario.

```
GET /api/habitos/historial/2
```

---

## 💬 GrowBot

### POST /api/chat

Conversa con el asistente virtual.

**Body → raw → JSON**

```json
{
  "usuarioId": 2,
  "mensaje": "¿Cómo reciclo una botella?"
}
```

---

## 📍 Puntos de acopio

### GET /api/acopio

Obtiene todos los puntos de acopio.

```
GET /api/acopio
```

También puedes enviar la ubicación del usuario para obtener los puntos más cercanos.

**Ejemplo**

```
GET /api/acopio?lat=-12.0464&lng=-77.0428
```

---

## 📦 Materiales

### GET /api/materiales

Obtiene el catálogo de materiales.

```
GET /api/materiales
```

---

## 🔧 Prueba de Gemini

### GET /api/test-gemini

Comprueba la conexión con Gemini.

```
GET /api/test-gemini
```

---

# 📋 Resumen

| Método | Endpoint | Body |
|---------|----------|------|
| GET | `/` | — |
| GET | `/health` | — |
| GET | `/api/materiales` | — |
| GET | `/api/test-gemini` | — |
| POST | `/api/classify` | form-data (`image`, `usuarioId`) |
| GET | `/api/stats/:usuarioId` | — |
| GET | `/api/historial/:usuarioId` | — |
| GET | `/api/habitos` | — |
| POST | `/api/habitos/completar` | raw JSON |
| GET | `/api/habitos/historial/:usuarioId` | — |
| POST | `/api/chat` | raw JSON |
| GET | `/api/acopio` | — *(opcional `lat` y `lng` como query params)* |