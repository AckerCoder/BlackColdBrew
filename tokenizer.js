const Spec = [
  [/^\s+/, null],

  [/^\/\*[\s\S]*?\*\//, null],

  [/^[!=]=/, "EQUALITY_OPERATOR"],

  [/^=/, "SIMPLE_ASSIGN"],

  [/^[+-]/, "ADDITIVE_OPERATOR"],
  [/^[*\/]/, "MULTIPLICATIVE_OPERATOR"],

  [/^{/, "{"],
  [/^}/, "}"],
  [/^\(/, "("],
  [/^\)/, ")"],

  [/^,/, ","],
  [/^\./, "."],

  [/^\blet\b/, "let"],
  [/^\bint\b/, "int"],
  [/^\bstring\b/, "string"],
  [/^\bboolean\b/, "boolean"],

  [/^\bif\b/, "if"],
  [/^\bwhile\b/, "while"],
  [/^\bprint\b/, "print"],
  [/^\bread\b/, "read"],

  [/^\btrue\b/, "TRUE"],
  [/^\bfalse\b/, "FALSE"],

  [/^\d[\d.e_-]*/, "NUMBER"],

  [/^".*?(?<!\\)"/, "STRING"],

  [/^\w+/, "IDENTIFIER"],
];

class Tokenizer {
  init(string) {
    this._string = string;
    this._cursor = 0;
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      let tokenValue = this._match(regexp, string);
      if (tokenValue === null) {
        continue;
      }

      if (tokenType === null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    let char = string[0];
    throw new SyntaxError(`Unexpected token: "${char}"`);
  }

  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  _match(regexp, string) {
    const matched = regexp.exec(string);
    if (matched === null) {
      return null;
    }

    this._cursor += matched[0].length;

    return matched[0];
  }
}

export { Tokenizer };
