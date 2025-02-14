require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(express.json());

app.use(cors());

const sql = neon(`${process.env.DATABASE_URL}`);

app.get("/ping", async (_, res) => {
  res.json("👍");
});

// Read all components
app.get("/subscribers", async (_, res) => {
  try {
    const query = `SELECT * FROM suscriptores;`;

    const rows = await sql(query);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching components:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje, origen } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: "Nombre y email son requeridos" });
    }

    const query = `INSERT INTO suscriptores (nombre, correo, telefono, mensaje, origen)  
                     VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

    const values = [nombre, correo, telefono, mensaje, origen];

    const result = await sql(query, values);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error inserting subscriber:", error);

    if (error.code === "23505") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});
