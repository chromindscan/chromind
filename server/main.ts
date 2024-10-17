// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express@4.18.2";
import { openaiRouter } from "./openaiRouter.ts";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Chromia OpenAI API Logger!");
});

app.use("/v1", openaiRouter);


app.listen(8000, () => console.log("Server running on http://localhost:8000/"));
