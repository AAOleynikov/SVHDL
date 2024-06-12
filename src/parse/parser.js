/*******************************************************************
 * VHDL SIGNAL OF ARCHITECTURE && PORTS OF ENTITY && HEADER PARSER *
 * V0.1.4														   *
 * 2024.05.01 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

//var input для тестого ввода находится в test_input.js

//Пример распаршенного объекта
/*
{
   "header_declaration":"library IEEE ; use IEEE.STD_LOGIC_1164.all ; ",
   "entity":{
      "name":"jk_with_polar_control",
      "ports":[
         {  											//вид до добавления стимуляторов
            "name":"not_S",
            "type":"inout",
            "subtype":"STD_LOGIC"
         },
         {												//вид после добавления стимуляторов
            "name":"K",
            "sub_type":"in",
            "subtype":"STD_LOGIC",
            "stimulus":{
               "stimulus_type":"Clock",
               "low_value":0,
               "high_value":1,
               "starts_with":"low_value",
               "duty_cycle":50,
               "period":10
            }
         }
      ]
   }
   "architectures":[
      {
         "name":"jk_with_polar_control",
         "of":"jk_with_polar_control",
         "signals":[
            {
               "name":"Q1",
               "type":"STD_LOGIC"
            }, ...
         ]
      },
      {
         "name":"jk_with_polar_control_2",
         "of":"jk_with_polar_control",
         "signals":[
            {
               "name":"Q1",
               "type":"STD_LOGIC"
            }, ...
         ]
      }
   ]
}
*/

/*
	TODO
	Пересмотреть классовую архитектуру
*/

/*
	Questions

	Какой формат лучше при инициализации сигналов:
		(1)this.signals.push({'name' : signal_name, 'type' : signal_type});
		VS
		(2)this.signals.push({'name' : signal_name, 'type' : signal_type, stimulus : NULL});
	От этого будет зависеть дальнейший формат проверки на наличие/отсутсвие сигнала в генераторе кода
	Текущий: this.signals.push({'name' : signal_name, 'type' : signal_type});

*/

//Подключение заголовочных файлов, связанных c antlr4
import antlr4 from "antlr4";
import vhdlLexer from "./build/vhdlLexer.js";
import vhdlParser from "./build/vhdlParser.js";
import vhdlParserListener from "./build/vhdlParserListener.js";
import { ParsedVhdlFile,ParsedArchitecture,ParsedEntity } from "@/lib/vhdlFile.ts";
const { CommonTokenStream, InputStream } = antlr4;



//перегружаем стандартные методы класса Listener для обработки
export default class MVHDLListener extends vhdlParserListener {
  constructor(_vhdlFileTop) {
    super();
    this.vhdlFileTop = _vhdlFileTop;
  }

  exitEntity_declaration(ctx) {
    const new_entity = new ParsedEntity(ctx.children[1].getText()); //entity decl with entity decl
    var count_of_ports_strings = ctx
      .port_clause()
      .port_list()
      .interface_list()
      .interface_element().length;
    var count_of_ports_in_string;
    var port_name;
    var port_type;
    var port_subtype;
    for (var i = 0; i < count_of_ports_strings; i++) {
      count_of_ports_in_string = ctx
        .port_clause()
        .port_list()
        .interface_list()
        .interface_element()
        [i].interface_declaration()
        .interface_object_declaration()
        .interface_signal_declaration()
        .identifier_list().children.length;
      for (var j = 0; j < count_of_ports_in_string; j += 2) {
        port_name = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .identifier_list()
          .children[j].getText();
        port_type = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .signal_mode()
          .getText();
        port_subtype = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .subtype_indication()
          .getText();
        new_entity.appendPort(port_name, port_type, port_subtype);
      }
    }
    this.vhdlFileTop.setEntity(new_entity);
  }

  exitContext_item(ctx) {
    var text_with_sep = "";
    var count_of_tokens = ctx.children[0].children.length;
    for (var i = 0; i < count_of_tokens; i++)
      text_with_sep += ctx.children[0].children[i].getText() + " ";
    this.vhdlFileTop.setHeader(text_with_sep);
  }

  exitArchitecture_body(ctx) {
    //KW_ARCHITECTURE identifier KW_OF name KW_IS
    const new_architecture = new ParsedArchitecture(
      ctx.children[1].getText(),
      ctx.children[3].getText()
    );
    var count_of_gramm = ctx.block_declarative_item().length;
    for (var i = 0; i < count_of_gramm; i++) {
      if (
        ctx
          .block_declarative_item()
          [i].children[0].children[0].getText()
          .slice(0, 6)
          .toLowerCase() == "signal"
      ) {
        var signals_count =
          ctx.block_declarative_item()[i].children[0].children[0].children[1]
            .children.length;
        for (var j = 0; j < signals_count; j += 2) {
          new_architecture.appendSignal(
            ctx
              .block_declarative_item()
              [i].children[0].children[0].children[1].children[j].getText(),
            ctx
              .block_declarative_item()
              [i].children[0].children[0].children[3].getText()
          );
        }
      }
    }
    this.vhdlFileTop.appendArchitecture(new_architecture);
  }
}

export const processCode = (input) => {
  //В этот объект будет записана вся распаршенная информация
  const vhdlFileTop = new ParsedVhdlFile();

  var chars = new InputStream(input, true);
  var lexer = new vhdlLexer(chars);
  var tokens = new CommonTokenStream(lexer);
  var parser = new vhdlParser(tokens);
  parser.buildParseTrees = true;
  var tree = parser.design_file();
  var listener = new MVHDLListener(vhdlFileTop);
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

  //установка стимулятора в виде частотного генератора для сигнала K
  vhdlFileTop.setStimulusClock("K", 10, 0, 1, "low_value", 50);

  return vhdlFileTop;
};
