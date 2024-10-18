// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express@4.18.2";
import { openaiRouter } from "./openaiRouter.ts";
import * as path from "jsr:@std/path";
import { getLogs } from "./chromia.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/logs", async (req, res) => {
  // query params
  const { start_time, end_time, pointer, n_prompts} = req.query;

  res.json(await getLogs(
    Number(start_time) || 0, 
    Number(end_time) || Date.now(), 
    Number(pointer) || 0, 
    Number(n_prompts) ||  10
  ))
})

app.use("/v1", openaiRouter);


app.listen(8000, () => console.log("Server running on http://localhost:8000/"));
