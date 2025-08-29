/* Этот файл не включается в бандл. Этот скрипт нужен только для того, чтобы построить парсер из g4-файлов */
import * as fs from "node:fs";
import { exec } from "child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const DIRECTORY_FOR_CODEGEN = "./build";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PARSERS_DIRECTORY_PATH = resolve(__dirname);

process.chdir(PARSERS_DIRECTORY_PATH);

if (!fs.existsSync(DIRECTORY_FOR_CODEGEN)) {
  fs.mkdirSync(DIRECTORY_FOR_CODEGEN);
  console.log('Folder "build" created');
} else {
  console.log('Folder "build" already exists');
}

const command = `antlr4 -Dlanguage=JavaScript vhdlLexer.g4 vhdlParser.g4 -visitor -listener -o ${DIRECTORY_FOR_CODEGEN}`;
exec(command, (error, _, stderr) => {
  if (error) {
    console.error(`Error executing command: ${stderr}`);
  } else {
    console.log(`Succesfully generated parsers`);
  }
});
