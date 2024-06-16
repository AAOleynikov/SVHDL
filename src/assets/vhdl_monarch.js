export const vhdl_lang = {
  defaultToken: "invalid", // токен, получаемый при невозможности распознать
  ignoreCase: true, // VHDL - регистронечувствительный
  tokenPostfix: ".vhdl", // постфикс, добавляемый ко всем токенам

  // ключевые слова VHDL
  keywords: [
    "process",
    "context",
    "postponed",
    "linkage",
    "component",
    "default",
    "then",
    "block",
    "rem",
    "inertial",
    "next",
    "entity",
    "on",
    "group",
    "xnor",
    "file",
    "pure",
    "guarded",
    "generic",
    "range",
    "else",
    "use",
    "shared",
    "mod",
    "loop",
    "record",
    "signal",
    "reject",
    "begin",
    "sla",
    "disconnect",
    "of",
    "procedure",
    "srl",
    "vunit",
    "attribute",
    "variable",
    "property",
    "unaffected",
    "xor",
    "register",
    "subtype",
    "to",
    "new",
    "report",
    "constant",
    "buffer",
    "body",
    "after",
    "transport",
    "function",
    "end",
    "select",
    "or",
    "library",
    "elsif",
    "sll",
    "map",
    "sra",
    "protected",
    "downto",
    "label",
    "all",
    "alias",
    "generate",
    "nor",
    "in",
    "release",
    "exit",
    "return",
    "with",
    "until",
    "and",
    "inout",
    "wait",
    "nand",
    "array",
    "force",
    "while",
    "impure",
    "package",
    "units",
    "assert",
    "parameter",
    "severity",
    "literal",
    "for",
    "ror",
    "if",
    "out",
    "rol",
    "is",
    "sequence",
    "others",
    "type",
    "case",
    "not",
    "configuration",
    "open",
    "architecture",
    "bus",
    "access",
    "when",
    "port",
    "null",
  ],

  // хакарктеристика системы счисления числа, которое будет идти далее
  // (U) B - (беззнаковый) бинарный
  // (U) O - (беззнаковый) восьмеричный
  // (U) D - (беззнакоый) десятичный
  // (U) X - (беззнаковый) шестнадцатеричный
  //base_specifier: ['B', 'O', 'X', 'U B', 'U O', 'U X', 'S B', 'S O', 'S X', 'D'],

  // основные специальные символы
  /*
    special_character: ['#', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ';',
      '<', '=', '>', '?', '@', '[', ']', '_', '`', '|'],
    */

  // иные специальные символы
  /*
    other_special_character: [
      '!', '$', '%', '^', '{', '}', '~', '´',
      ' ', 'Ў', 'ў', 'Ј', '¤', 'Ґ',
      'Ё', '©', 'Є', '«', '¬', '¬', '§', 'Ї',
      '°', '±', 'І', 'і', 'ґ', 'µ', '¶', '·',
      'ё', '№', 'є', '»', 'ј', 'Ѕ', 'ѕ', 'ї',
      'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З',
      'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П',
      'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч',
      'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я',
      'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з',
      'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п',
      'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч',
      'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
      ' ', '¡', '¢', '£', '¦', '¥', '®', '¯',
      '¸', '¹', 'º', '¼', '½', '¾', '¿', '²',
      '³', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Æ', 'Ç',
      'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
      'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×',
      'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
      'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç',
      'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
      'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷',
      'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ',
      '¨', 'ª'
    ],
    */

  // операторы языка VHDL
  operators:
    /=|>|<|!|~|\?|:|==|<=|>=|!|&&|\|\||\+\+|--|\+|-|\*|\/|&|\||\^|%|<<|>>|>>>|\+=|-=|\*=|\/=|&=|\|=|\^=|%=|<<=|>>=|>>>=/,

  brackets: [
    { open: "(", close: ")", token: "delimiter.parenthesis" },
    { open: "{", close: "}", token: "delimiter.curly" },
    { open: "[", close: "]", token: "delimiter.square" },
  ],

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // пробельные символы, однострочные комментарии и начало многострочного комментария
      // include подразумевает прямое включение правил whitespace в тело root
      /* располагаем в начале для оптимизации производительности, поскольку это наиболее
           распространённая группа токенов */
      { include: "@whitespace" },

      // операторы (<,>=,&& etc.)
      [/@operators/, "operators"],

      // идентификаторы и ключевые слова
      [
        /[a-zA-Z]((_)?[a-zA-Z0-9])*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // delimiters and operators
      //[/[{}()\[\]]/, '@brackets'],

      // numbers
      //[/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      //[/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, "number"],
      [/[{}()\[\]]/, "@brackets"],
      // delimiter: after number because of .\d floats
      [/[;,.:]/, "delimiter"], //,

      // strings
      //[/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string

      //[/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // characters
      // [/'[^\\']'/, 'string'],
      //[/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      //[/'/, 'string.invalid']
    ],

    string: [
      [/[^\\"]+/, "string"],
      //[/@escapes/, 'string.escape'],
      [/\\./, "string.escape.invalid"],
      [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"], // пробел, табуляция, перевод каретки, перевод строки
      [/\/\*/, "comment", "@comment"], // начало многострочного комментария
      [/--.*$/, "comment"], // однострочный комментарий
    ],

    comment: [
      [/[^\/*]+/, "comment"], // тело многострочного комментария
      [/\*\//, "comment", "@pop"], // конец многострочного комментария
      [/[\/*]/, "comment"], // тело многострочного комментария
    ],
  },
};
