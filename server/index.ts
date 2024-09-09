import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;
const API_PREFIX = "/api";

const prisma = new PrismaClient();

app.post(`${API_PREFIX}/create`, async (_, res) => {
  try {
    const { uid } = await fetch("http://127.0.0.1:8080").then((res) =>
      res.json()
    );
    // const uid = Math.random().toString(36).slice(-8);

    const user = await prisma.user.findUnique({ where: { uid } });

    if (user) {
      res.send("Already exists");
      return;
    }

    await prisma.user.create({ data: { uid } });
    res.send(uid);
  } catch (e) {
    res.send(e);
  }
});

app.put(`${API_PREFIX}/update`, async (req, res) => {
  const { uid, medals } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { uid } });

    if (!user) {
      res.send("Cannot find user");
      return;
    }

    await prisma.user.update({ where: { uid }, data: { medals } });
    res.send("OK");
  } catch (e) {
    throw e;
  }
});

app.listen(port, "0.0.0.0", () => console.log(`http://localhost:${port}`));
