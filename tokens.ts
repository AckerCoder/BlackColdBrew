const reserved_words_map = new Map<string, string>();
reserved_words_map.set("print", "PRINT_STATEMENT");

const delimitators_map = new Map<string, string>();
delimitators_map.set("/*", "OPEN_COMMENT");
delimitators_map.set("*/", "CLOSE_COMMENT");
delimitators_map.set("{", "OPEN_BLOCK");
delimitators_map.set("}", "CLOSE_BLOCK");
delimitators_map.set("(", "OPEN_SCOPE");
delimitators_map.set(")", "CLOSE_SCOPE");
delimitators_map.set("$", "END_OF_PROGRAM");
delimitators_map.set("“", "OPEN_STRING");
delimitators_map.set("”", "CLOSE_STRING");

const operators_map = new Map<string, string>();
operators_map.set("=", "ASSING_OPERATOR");
operators_map.set("==", "COMPARISION_OPERATOR_EQUAL");
operators_map.set("!=", "COMPARISION_OPERATOR_NOT_EQUAL");
operators_map.set("+", "INT_OPERATOR_NOT_PLUS");
operators_map.set("-", "INT_OPERATOR_NOT_MINUS");
operators_map.set("*", "INT_OPERATOR_NOT_PRODUCT");
operators_map.set("/", "INT_OPERATOR_NOT_DIVIDE");

const types_map = new Map<string, string>();
types_map.set("int", "INT_TYPE");
types_map.set("string", "STRING_TYPE");
types_map.set("boolean", "BOOLEAN_TYPE");

const id_map = new Map<string, string>();
types_map.set("id", "ID");

export const staticTokens = new Map<string, string>([
  ...delimitators_map,
  ...types_map,
  ...operators_map,
  ...reserved_words_map,
  ...id_map,
]);
