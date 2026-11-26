import { randomBytes, pbkdf2Sync } from "node:crypto";
import { readFile, rename, writeFile, rm } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

async function readPassword() {
  if (!process.stdin.isTTY) {
    process.stdin.setEncoding("utf8");
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    return input.replace(/\r?\n$/, "");
  }
  const silent = new Writable({
    write(_chunk, _encoding, done) {
      done();
    },
  });
  const prompt = createInterface({
    input: process.stdin,
    output: silent,
    terminal: true,
  });
  process.stderr.write("Senha do administrador (entrada oculta): ");
  try {
    return await prompt.question("");
  } finally {
    prompt.close();
    process.stderr.write("\n");
  }
}

const password = await readPassword();
if (!password || password.length > 256)
  throw new Error("Use uma senha de 1 a 256 caracteres.");
const salt = randomBytes(16);
const key = pbkdf2Sync(password, salt, 100000, 32, "sha256");
const verifier = ["v1", salt.toString("hex"), key.toString("hex")].join(":");
if (process.argv.includes("--verifier")) {
  process.stdout.write(verifier + "\n");
} else {
  const file = ".dev.vars";
  const current = await readFile(file, "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  const entry = "BEGOAT_ADMIN_VERIFIER=" + verifier;
  const updated = /^BEGOAT_ADMIN_VERIFIER=.*$/m.test(current)
    ? current.replace(/^BEGOAT_ADMIN_VERIFIER=.*$/m, entry)
    : current.replace(/\n?$/, "\n") + entry + "\n";
  const temp = ".dev.vars." + randomBytes(8).toString("hex");
  try {
    await writeFile(temp, updated, { mode: 0o600, flag: "wx" });
    await rename(temp, file);
  } finally {
    await rm(temp, { force: true });
  }
  process.stdout.write("Acesso local configurado para o usuário admin.\n");
}
