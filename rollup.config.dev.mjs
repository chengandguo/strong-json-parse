import typescript from "@rollup/plugin-typescript";

import serve from "rollup-plugin-serve";

const serverConfig = {
  open: true,
  openPage: "/document/index.html",
  port: "9000",
};

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "./lib/bundle.min.js",
      format: "iife",
      name: "StrongJsonParse", // need config
      sourcemap: true,
      plugins: [serve(serverConfig)],
    },
  ],
  plugins: [typescript()],
};
