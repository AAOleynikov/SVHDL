![RK6](https://github.com/AAOleynikov/MVHDL/assets/157613831/19e7d8c5-7ebb-46ea-9561-be825d3d8943)

# MVHDL - simple VHDL runner for BMSTU RK6 electrical engineering course

# Используемые технологии:

- Vue (фронтенд)
- ANTLR4 + Java (для запуска генератора)

# Запуск проекта

### Установка пакетов npm

`npm i`

### Сборка парсеров

Для начала надо установить JDK актуальной версии. Например, `OpenJDK`.

Далее надо установить antlr4. На Windows проще всего сделать:
`python -m pip install antlr4-tools`
Он скачает exe, добавит его в поддиректорию `Scripts` директории `Python3XX`. Скорее всего, на Вашей машине эта директория находится в Path, если не находится - добавьте.

#### Автоматическая сборка

Запустить `npm run build-parsers`, он сам сгенерирует парсеры

#### Ручная сборка (если не получилась автоматическая сборка)

Компиляция vhdlLexer.g4 и vhdlParser.g4 в js производится с помощью команды:
`antlr4 -Dlanguage=JavaScript vhdlLexer.g4 vhdlParser.g4`

### Запуск Development Server

`npm run dev`
