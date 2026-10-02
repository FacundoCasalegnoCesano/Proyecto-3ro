import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const projectRoot = resolve(process.cwd());
const outputArgument = process.argv[2];
const dumpExecutable = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";

function outputPath(value) {
  if (!value || !isAbsolute(value)) throw new Error("Indicá una ruta absoluta para el respaldo SQL.");
  const path = resolve(value);
  const relativePath = relative(projectRoot, path);
  if (!relativePath.startsWith("..") && relativePath !== "..") {
    throw new Error("El respaldo SQL debe guardarse fuera del proyecto.");
  }
  return path;
}

function databaseConfig() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL no está configurada.");
  const url = new URL(value);
  if (!url.hostname || !url.pathname.slice(1)) throw new Error("DATABASE_URL no identifica una base MySQL.");
  return {
    host: url.hostname,
    port: url.port || "3306",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
  };
}

async function inspectDump(path) {
  const hash = createHash("sha256");
  const input = createReadStream(path, { encoding: "utf8" });
  const lines = createInterface({ input, crlfDelay: Infinity });
  let tableCount = 0;
  let forbidden = false;
  for await (const line of lines) {
    hash.update(`${line}\n`);
    if (/^CREATE TABLE `/.test(line)) tableCount += 1;
    if (/\b(?:DROP\s+(?:DATABASE|TABLE|VIEW|TRIGGER|PROCEDURE|FUNCTION|EVENT)|CREATE\s+DATABASE|USE\s+)/i.test(line.trim())) forbidden = true;
  }
  if (forbidden) throw new Error("El respaldo incluye una instrucción que puede borrar o cambiar de base.");
  const { size } = await stat(path);
  return { tableCount, size, sha256: hash.digest("hex") };
}

let temporaryPath;
try {
  const path = outputPath(outputArgument);
  temporaryPath = `${path}.tmp`;
  const config = databaseConfig();
  await mkdir(dirname(path), { recursive: true });

  const args = [
    `--host=${config.host}`,
    `--port=${config.port}`,
    `--user=${config.user}`,
    "--single-transaction",
    "--skip-lock-tables",
    "--no-tablespaces",
    "--set-gtid-purged=OFF",
    "--column-statistics=0",
    "--skip-add-drop-table",
    "--skip-triggers",
    "--result-file=" + temporaryPath,
    config.database,
  ];
  const childEnvironment = { ...process.env, MYSQL_PWD: config.password };
  delete childEnvironment.DATABASE_URL;
  const child = spawn(dumpExecutable, args, {
    windowsHide: true,
    env: childEnvironment,
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("close", resolveExit);
  });
  if (exitCode !== 0) {
    await rm(temporaryPath, { force: true });
    throw new Error(`mysqldump terminó con código ${exitCode}${stderr ? `: ${stderr.trim()}` : "."}`);
  }

  const metadata = await inspectDump(temporaryPath);
  await rename(temporaryPath, path);
  console.log(`Respaldo creado: ${path}`);
  console.log(`${metadata.tableCount} tablas; ${metadata.size} bytes; SHA-256 ${metadata.sha256}`);
} catch (error) {
  if (temporaryPath) await rm(temporaryPath, { force: true });
  console.error(error instanceof Error ? error.message : "Falló el respaldo SQL.");
  process.exitCode = 1;
}
