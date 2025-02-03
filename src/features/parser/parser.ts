/*******************************************************************
 * VHDL SIGNAL OF ARCHITECTURE && PORTS OF ENTITY && HEADER PARSER *
 *                                                                 *
 * 2024.05.01 Oleynikov Anton 	https://github.com/AAOleynikov	   *
 * ****************************************************************/

import {
  ParseTreeListener,
  ParseTreeWalker,
  CommonTokenStream,
  InputStream,
} from "antlr4";
// @ts-expect-error: сгенерированный код
import vhdlLexer from "./build/vhdlLexer";
// @ts-expect-error: сгенерированный код
import vhdlParser from "./build/vhdlParser";
// @ts-expect-error: сгенерированный код
import vhdlParserListener from "./build/vhdlParserListener";
import {
  ParsedVhdlFile,
  ParsedArchitecture,
  ParsedEntity,
} from "@/lib/parsedFile";

//перегружаем стандартные методы класса Listener для обработки
export default class SVHDLListener
  extends vhdlParserListener
  implements ParseTreeListener
{
  vhdlFileTop: ParsedVhdlFile;
  constructor(_vhdlFileTop: ParsedVhdlFile) {
    super();
    this.vhdlFileTop = _vhdlFileTop;
  }

  exitEntity_declaration(ctx: any) {
    const new_entity = new ParsedEntity(
      ctx.children[1].getText(),
      this.vhdlFileTop.fileName
    ); //entity decl with entity decl
    ctx
      .port_clause()
      .port_list()
      .interface_list()
      .interface_element()
      .forEach((element: any) => {
        const count_of_ports_in_string = element
          .interface_declaration()
          .interface_object_declaration()
          .interface_signal_declaration()
          .identifier_list().children.length;
        for (let j = 0; j < count_of_ports_in_string; j += 2) {
          const port_name = element
            .interface_declaration()
            .interface_object_declaration()
            .interface_signal_declaration()
            .identifier_list()
            .children[j].getText();
          const port_mode = element
            .interface_declaration()
            .interface_object_declaration()
            .interface_signal_declaration()
            .signal_mode()
            .getText();
          const port_type = element
            .interface_declaration()
            .interface_object_declaration()
            .interface_signal_declaration()
            .subtype_indication()
            .getText();
          new_entity.appendPort(port_name, port_type, port_mode);
        }
      });
    this.vhdlFileTop.addEntity(new_entity);
  }

  exitContext_item(ctx: any) {
    let text_with_sep = "";
    const count_of_tokens = ctx.children[0].children.length;
    for (let i = 0; i < count_of_tokens; i++)
      text_with_sep += ctx.children[0].children[i].getText() + " ";
    this.vhdlFileTop.setHeader(text_with_sep);
  }

  exitArchitecture_body(ctx: any) {
    //KW_ARCHITECTURE identifier KW_OF name KW_IS
    const new_architecture = new ParsedArchitecture(
      ctx.children[1].getText(),
      ctx.children[3].getText()
    );

    ctx.block_declarative_item().forEach((item: any) => {
      if (
        item.children[0].children[0].getText().slice(0, 6).toLowerCase() ==
        "signal"
      ) {
        const signals_count =
          item.children[0].children[0].children[1].children.length;
        for (let j = 0; j < signals_count; j += 2) {
          new_architecture.appendSignal(
            item.children[0].children[0].children[1].children[j].getText(),
            item.children[0].children[0].children[3].getText()
          );
        }
      }
    });
    this.vhdlFileTop.appendArchitecture(new_architecture);
  }
  visitTerminal() {}
  visitErrorNode() {}
  enterEveryRule() {}
  exitEveryRule() {}
}

export function processCode(input: string, fileName: string) {
  // В этот объект будет записана вся распаршенная информация
  const vhdlFileTop = new ParsedVhdlFile(fileName);

  const chars = new InputStream(input, true);
  const lexer = new vhdlLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new vhdlParser(tokens);
  console.log("tokens: ", tokens);
  parser.buildParseTrees = true;
  const tree = parser.design_file();
  const listener = new SVHDLListener(vhdlFileTop);
  ParseTreeWalker.DEFAULT.walk(listener, tree);

  return vhdlFileTop;
}
