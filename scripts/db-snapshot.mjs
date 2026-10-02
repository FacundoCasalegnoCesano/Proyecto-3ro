import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const [operation, fileArgument] = process.argv.slice(2);
const projectRoot = resolve(process.cwd());

function externalPath(value) {
  if (!value) throw new Error("Indicá una ruta absoluta fuera del proyecto.");
  const path = isAbsolute(value) ? resolve(value) : resolve(projectRoot, value);
  const pathFromProject = relative(projectRoot, path);
  if (!pathFromProject.startsWith("..") && pathFromProject !== "..") {
    throw new Error("El archivo debe guardarse fuera del proyecto.");
  }
  return path;
}

function quoteIdentifier(value) {
  return `\`${String(value).replaceAll("`", "``")}\``;
}

function encode(value) {
  if (value instanceof Date) {
    return { __dbSnapshotType: "date", value: value.toISOString() };
  }
  if (typeof value === "bigint") {
    return { __dbSnapshotType: "bigint", value: String(value) };
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { __dbSnapshotType: "buffer", value: Buffer.from(value).toString("base64") };
  }
  return value;
}

function fingerprint(rows, columns) {
  const serializedRows = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column, encode(row[column])])
  ));
  serializedRows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return {
    rowCount: rows.length,
    sha256: createHash("sha256").update(JSON.stringify(serializedRows)).digest("hex"),
  };
}

async function backup(path) {
  const tables = await prisma.$transaction(async (tx) => {
    const tableRows = await tx.$queryRawUnsafe(
      "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'"
    );
    const result = [];

    for (const tableRow of tableRows) {
      const name = String(Object.values(tableRow)[0]);
      const quoted = quoteIdentifier(name);
      const [definition] = await tx.$queryRawUnsafe(`SHOW CREATE TABLE ${quoted}`);
      const columns = await tx.$queryRawUnsafe(`SHOW COLUMNS FROM ${quoted}`);
      const rows = await tx.$queryRawUnsafe(`SELECT * FROM ${quoted}`);
      const names = columns.map((column) => column.Field);
      result.push({
        name,
        createSql: Object.values(definition)[1],
        columns: names,
        ...fingerprint(rows, names),
        rows: rows.map((row) => Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, encode(value)])
        )),
      });
    }
    return result;
  }, { isolationLevel: "RepeatableRead" });

  const temporaryPath = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify({ version: 1, tables }, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
  console.log(`Respaldo completo creado: ${path} (${tables.length} tablas).`);
}

async function verify(path) {
  const snapshot = JSON.parse(await readFile(path, "utf8"));
  if (snapshot.version !== 1 || !Array.isArray(snapshot.tables)) {
    throw new Error("El archivo no es un snapshot de base compatible.");
  }

  const mismatches = [];
  for (const table of snapshot.tables) {
    const quoted = quoteIdentifier(table.name);
    const columns = table.columns.map(quoteIdentifier).join(", ");
    const rows = await prisma.$queryRawUnsafe(`SELECT ${columns} FROM ${quoted}`);
    const current = fingerprint(rows, table.columns);
    if (current.rowCount !== table.rowCount || current.sha256 !== table.sha256) {
      mismatches.push(table.name);
    }
  }

  if (mismatches.length) {
    throw new Error(`No coinciden conteo/checksum de tablas: ${mismatches.join(", ")}`);
  }
  console.log(`Conteos y SHA-256 coinciden en ${snapshot.tables.length} tablas.`);
}

try {
  const path = externalPath(fileArgument);
  if (operation === "backup") await backup(path);
  else if (operation === "verify") await verify(path);
  else throw new Error("Uso: node scripts/db-snapshot.mjs backup|verify <ruta-absoluta-fuera-del-proyecto>");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Falló la operación de snapshot.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
