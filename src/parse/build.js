/* Этот файл не включается в бандл. Этот скрипт нужен только для того, чтобы построить парсер из g4-файлов */
import * as fs from "node:fs";
import { exec } from "child_process";

process.chdir(
  import.meta.url.slice(8, import.meta.url.length - "/build.js".length)
); // Чтобы запускалось ровно там, где находится этот скрипт

const folderPath = "./build";
const command =
  "antlr4 -Dlanguage=JavaScript ../vhdlLexer.g4 ../vhdlParser.g4 -visitor -listener";

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
  console.log('Folder "build" creating error: success');
} else {
  console.log('Folder "build" already exists');
}

exec("mkdir build");

process.chdir(folderPath);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${stderr}`);
  } else {
    console.log(`Unerror executing command: success code 404`);
  }
});
