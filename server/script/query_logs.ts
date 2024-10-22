import { getLogs } from "../server/chromia.ts";

async function main() {
  const res = await getLogs(Date.now() - 20 * 60 * 1000, Date.now(), 0, 20);
  console.log(res);
}

main();
