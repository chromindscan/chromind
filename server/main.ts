import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { openaiRouter } from "./openaiRouter.ts";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({"success": true})
});

app.use("/v1", openaiRouter);


app.listen(8000, () => console.log("Server running on http://localhost:8000/"));
