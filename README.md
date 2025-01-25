<div style="text-align: center;">
    <img src="https://github.com/AAOleynikov/MVHDL/assets/157613831/19e7d8c5-7ebb-46ea-9561-be825d3d8943" alt="RK6" width="200" style="display:inline-block; margin: 5px;">
    <img src="https://github.com/user-attachments/assets/4ed0606c-ab9b-41ca-9151-772399b2e51d" alt="Image 2" width="200" style="display:inline-block; margin: 5px;">
    <img src="https://github.com/user-attachments/assets/dd397784-c4b8-41d7-855c-de774b87fd15" alt="Image 2" width="355" style="display:inline-block; margin: 5px;">
</div>

<div style="text-align: center;" markdown="1">
# SVHDL - simple web VHDL runner for RK6 electrical engineering course
</div>


## Основные возможности SVHDL:

* Написание кода на VHDL во встроенном редакторе;
* Выбор верхнеуровневой сущности и её архитектуры;
* Задание входных сигналов несколькими способами (константа, миандр, ручной режим) в testbench генераторе;
* Просмотр полученных в ходе симулирования Waveforms;
* Пошаговая отладка сущности;

## Используемые технологии:

- Vue (фронтенд);
- Monaco Editor (в качетве редактора кода, тот же самый, что и в VS Code);
- ANTLR4 + Java (в качестве парсеров);
- GHDL;

## Как происходит запуск VHDL-кода

Проект для запуска VHDL-кода использует программу GHDL на серверной части;

У команды разработчиков проекта есть мечта - собрать nvc под WASM, но пока это сделать не получилось: не получается слинковать зависимости и WASM. Возможно, в будущем мечта сбудется.

Пока что SVHDL предполагает наличие сервера, который должен принимать VHDL-код, запускать его на linux и возвращать результаты симуляции. Исходный код сервера: https://github.com/AAOleynikov/SVHDL_back

## Сборка и запуск проекта

### Установка пакетов npm

`npm i`

### Сборка парсеров

Для начала надо установить JDK актуальной версии. Например, `OpenJDK`.

Далее надо установить antlr4. На Windows проще всего сделать:
`python -m pip install antlr4-tools`.
Он скачает exe, добавит его в поддиректорию `Scripts` директории `Python3XX`. Скорее всего, на Вашей машине эта директория находится в Path, если не находится - добавьте.

### Автоматическая сборка

Запустить `npm run build-parsers`, он сам сгенерирует парсеры

### Ручная сборка (если не получилась автоматическая сборка)

Компиляция vhdlLexer.g4 и vhdlParser.g4 в js производится с помощью команды:
`antlr4 -Dlanguage=JavaScript vhdlLexer.g4 vhdlParser.g4`

### Запуск Development Server

`npm run dev`

<div style="text-align: center;" markdown="1">
# Протокод развития SVHDL
</div>

## Глобальные части, которые необходимо реализовать в обязательном порядке:
    
- [x] Редактор кода.
- [] Wave-form viewer.
- [] Сохранение и загрузка проектов.
- Testbench генератор:
	- [] ANTLR4 парсер сущностей и их архитектур.
	- [] Выбор сущности.
	- [] Задание входных сигналов.

## Глобальные части, которые желательно реализовать:
- [] Подсветка синтаксиса в редакторе кода.

## Пожелания на будущее по реализации:
- [] Портировать движок nvc на фронт.
- [] Написать движок на JS для симулирования.