import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// 👉 guardar pedido
function guardarPedido(pedido) {
  let pedidos = [];

  try {
    pedidos = JSON.parse(fs.readFileSync("pedidos.json"));
  } catch {
    pedidos = [];
  }

  pedidos.push(pedido);
  fs.writeFileSync("pedidos.json", JSON.stringify(pedidos, null, 2));
}

// 👉 endpoint pago
app.post("/crear-pago", async (req, res) => {
  const { items } = req.body;

  const preference = {
    items: items.map(p => ({
      title: `${p.nombre} (${p.variante})`,
      unit_price: p.precio,
      quantity: p.cantidad
    })),
    back_urls: {
      success: "https://mirandafrancocba.github.io/Catalogo/gracias.html",
      failure: "https://mirandafrancocba.github.io/Catalogo/error.html"
    },
    auto_return: "approved"
  };

  try {
    const preferenceClient = new Preference(client);

    const response = await preferenceClient.create({
      body: preference
    });

    res.json({
      url: response.init_point
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creando pago");
  }
});

// ✅ SIEMPRE AL FINAL
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo 🚀 en puerto", PORT);
});