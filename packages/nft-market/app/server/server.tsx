import { config } from "./deps.ts";
import { serve } from "http";
import { render } from "./render.tsx";

const configPath = './deno.json';
const configFile = JSON.parse(Deno.readTextFileSync(configPath));
const importMap = JSON.parse(Deno.readTextFileSync(configFile?.importMap));

const port: number = Number(config()['APP_SSR_SERVER_PORT_PROD']);
const serverPath = `http://localhost:${port}`;

const handler = async (request: Request) => {
  const url = new URL(request.url);

  return new Response(
    await render({
      url,
      serverPath,
      importMap
    }),
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
};

console.log(`Server running ${serverPath}`);
serve(handler, { port });
