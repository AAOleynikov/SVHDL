/*******************************************************************
 * VHDL SIGNAL OF ARCHITECTURE && PORTS OF ENTITY && HEADER PARSER *
 * V0.1.4														   *
 * 2024.05.01 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

//Пример распаршенного объекта
/*
{
   "header_declaration":"library IEEE ; use IEEE.STD_LOGIC_1164.all ; ",
   "entity":{
      "name":"jk_with_polar_control",
      "ports":[
         {
            "name":"not_S",
            "type":"inout",
            "subtype":"STD_LOGIC"
         },
         {
            "name":"K",
            "sub_type":"in",
            "subtype":"STD_LOGIC",
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
      }
   ]
}
*/

//Подключение заголовочных файлов, связанных c antlr4
import { ParseTreeListener, ParseTreeWalker, CommonTokenStream, InputStream} from "antlr4";
import vhdlLexer from "./build/vhdlLexer";
import vhdlParser from "./build/vhdlParser";
import vhdlParserListener from "./build/vhdlParserListener";
import {
  ParsedVhdlFile,
  ParsedArchitecture,
  ParsedEntity,
} from "@/lib/parsedFile";

//перегружаем стандартные методы класса Listener для обработки
export default class SVHDLListener extends vhdlParserListener implements ParseTreeListener {
  vhdlFileTop: ParsedVhdlFile;
  constructor(_vhdlFileTop) {
    super();
    this.vhdlFileTop = _vhdlFileTop;
  }

  exitEntity_declaration(ctx) {
    const new_entity = new ParsedEntity(
      ctx.children[1].getText(),
      this.vhdlFileTop.fileName
    ); //entity decl with entity decl
    const count_of_ports_strings = ctx
      .port_clause()
      .port_list()
      .interface_list()
      .interface_element().length;
    for (let i = 0; i < count_of_ports_strings; i++) {
      const count_of_ports_in_string = ctx
        .port_clause()
        .port_list()
        .interface_list()
        .interface_element()
        [i].interface_declaration()
        .interface_object_declaration()
        .interface_signal_declaration()
        .identifier_list().children.length;
      for (let j = 0; j < count_of_ports_in_string; j += 2) {
        const port_name = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .identifier_list()
          .children[j].getText();
        const port_mode = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .signal_mode()
          .getText();
        const port_type = ctx
          .port_clause()
          .port_list()
          .interface_list()
          .interface_element()
          [i].interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .subtype_indication()
          .getText();
        new_entity.appendPort(port_name, port_type, port_mode);
      }
    }
    this.vhdlFileTop.addEntity(new_entity);
  }

  exitContext_item(ctx) {
    let text_with_sep = "";
    const count_of_tokens = ctx.children[0].children.length;
    for (let i = 0; i < count_of_tokens; i++)
      text_with_sep += ctx.children[0].children[i].getText() + " ";
    this.vhdlFileTop.setHeader(text_with_sep);
  }

  exitArchitecture_body(ctx) {
    //KW_ARCHITECTURE identifier KW_OF name KW_IS
    const new_architecture = new ParsedArchitecture(
      ctx.children[1].getText(),
      ctx.children[3].getText()
    );
    const count_of_gramm = ctx.block_declarative_item().length;
    for (let i = 0; i < count_of_gramm; i++) {
      if (
        ctx
          .block_declarative_item()
          [i].children[0].children[0].getText()
          .slice(0, 6)
          .toLowerCase() == "signal"
      ) {
        const signals_count =
          ctx.block_declarative_item()[i].children[0].children[0].children[1]
            .children.length;
        for (let j = 0; j < signals_count; j += 2) {
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
  visitTerminal() {}
  visitErrorNode() {}
  enterEveryRule() {}
  exitEveryRule() {}
}

export function processCode(input: string, fileName: string) {
  //В этот объект будет записана вся распаршенная информация
  const vhdlFileTop = new ParsedVhdlFile(fileName);

  const chars = new InputStream(input, true);
  const lexer = new vhdlLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new vhdlParser(tokens);
  parser.buildParseTrees = true;
  const tree = parser.design_file();
  const listener = new SVHDLListener(vhdlFileTop);
  ParseTreeWalker.DEFAULT.walk(listener, tree); // На ошибку похуй

  // //установка стимулятора в виде частотного генератора для сигнала K
  // vhdlFileTop.setStimulusClock("K", 10, 0, 1, "low_value", 50);

  return vhdlFileTop;
}
