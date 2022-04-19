import * as fs from "fs";
import { LexycalAnalyzerStatus } from "./interfaces";
import {
  findClosedScope,
  scanIdLex,
  scanLexWithoutLimitations,
  scanLexWithSpaceOrEndlLimitations,
} from "./scanners";
import { logError } from "./logs";
const filename = "test/lexical_analysis.txt";

let data: string = fs.readFileSync(filename, { encoding: "utf8", flag: "r" });

let lexycalAnalyzerInitialStatus: LexycalAnalyzerStatus = {
  currentPointer: 0,
  currentLinePointer: 0,
  currentLine: 0,
  text: data,
};

const lexical_analyzer = (
  currentStatus: LexycalAnalyzerStatus
): LexycalAnalyzerStatus => {
  const text = currentStatus.text;
  let pointer = currentStatus.currentPointer;
  let result;
  switch (text[pointer]) {
    //SPACE
    case " ":
      currentStatus.currentPointer = currentStatus.currentPointer + 1;
      return currentStatus;
    //END LINE
    case "\n":
      currentStatus.currentLine = currentStatus.currentLine + 1;
      currentStatus.currentPointer = currentStatus.currentPointer + 1;
      currentStatus.currentLinePointer = 0;
      return currentStatus;
    //DELIMITATORS
    case "/":
      result = scanLexWithoutLimitations(currentStatus, "/*");
      if (result) {
        result = findClosedScope(result, "*/");
        if (result) return result;
      }
    case "*":
      result = scanLexWithoutLimitations(currentStatus, "*/");
      if (result) return result;
    //STATEMENTS
    case "p":
      result = scanLexWithoutLimitations(currentStatus, "print");
      if (result) return result;
    case "r":
      result = scanLexWithoutLimitations(currentStatus, "read");
      if (result) return result;
    //TYPES
    case "i":
      result = scanLexWithSpaceOrEndlLimitations(currentStatus, "int");
      if (result) return result;
    case "s":
      result = scanLexWithSpaceOrEndlLimitations(currentStatus, "string");
      if (result) return result;
    case "b":
      result = scanLexWithSpaceOrEndlLimitations(currentStatus, "boolean");
      if (result) return result;
    //IF STATEMENT
    case "i":
      result = scanLexWithoutLimitations(currentStatus, "if");
      if (result) return result;
    //LOOP STATEMENT
    case "w":
      result = scanLexWithoutLimitations(currentStatus, "while");
      if (result) return result;
    //ASSIGMENT STATEMENT
    case "=":
      result = scanLexWithoutLimitations(currentStatus, "=");
      if (result) return result;
    //INT OPERATORS
    case "+":
      result = scanLexWithoutLimitations(currentStatus, "+");
      if (result) return result;
    case "-":
      result = scanLexWithoutLimitations(currentStatus, "-");
      if (result) return result;
    case "/":
      result = scanLexWithoutLimitations(currentStatus, "/");
      if (result) return result;
    case "*":
      result = scanLexWithoutLimitations(currentStatus, "*");
      if (result) return result;
    //BOOLLOP
    case "=":
      result = scanLexWithoutLimitations(currentStatus, "=");
      if (result) return result;
    case "(":
      result = scanLexWithoutLimitations(currentStatus, "(");
      if (result) return result;
    case ")":
      result = scanLexWithoutLimitations(currentStatus, ")");
      if (result) return result;
    case "{":
      result = scanLexWithoutLimitations(currentStatus, "{");
      if (result) return result;
    case "}":
      result = scanLexWithoutLimitations(currentStatus, "}");
      if (result) return result;
    case "$":
      result = scanLexWithoutLimitations(currentStatus, "$");
      if (result) return result;
    case "“":
      result = scanLexWithoutLimitations(currentStatus, "“");
      if (result) return result;
    case "”":
      result = scanLexWithoutLimitations(currentStatus, "”");
      if (result) return result;
    //IDs
    default:
      if (/[A-Za-z]/.test(text[pointer])) {
        result = scanIdLex(currentStatus);
        if (result) return result;
      }
  }
  currentStatus.currentPointer = currentStatus.currentPointer + 1;
  currentStatus.currentLinePointer = currentStatus.currentLinePointer + 1;
  return currentStatus;
};

while (
  lexycalAnalyzerInitialStatus.currentPointer <
    lexycalAnalyzerInitialStatus.text.length &&
  !lexycalAnalyzerInitialStatus.error
) {
  lexycalAnalyzerInitialStatus = lexical_analyzer(lexycalAnalyzerInitialStatus);
  if (lexycalAnalyzerInitialStatus.error) {
    logError(lexycalAnalyzerInitialStatus.error.message);
  }
}
