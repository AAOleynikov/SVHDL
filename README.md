![RK6](https://github.com/AAOleynikov/MVHDL/assets/157613831/19e7d8c5-7ebb-46ea-9561-be825d3d8943)

# MVHDL - simple VHDL runner for BMSTU RK6 electrical engineering course

# Используемые технологии:

- ANTLR4 + Java (для запуска генератора)

На Windows проще всего сделать 
`python -m pip install antlr4-tools`
он сам установит все необходимые зависимости

Компиляция vhdlLexer.g4 и vhdlParser.g4 в js производится с помощью комманды
`antlr4 -Dlanguage=JavaScript vhdlLexer.g4 vhdlParser.g4`

