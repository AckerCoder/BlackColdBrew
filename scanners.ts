import { LexycalAnalyzerStatus } from "./interfaces";
import { staticTokens } from "./tokens";
import * as fs from "fs";

const path = require("path");

const getChar = () => {};

const peekChar = (currentPosition: number, wordLength: number) =>
  currentPosition + wordLength + 1;

const filename = "test/lexical_analysis.txt";

let data: string = fs.readFileSync(filename, { encoding: "utf8", flag: "r" });

const logMessage = (
  token: string | undefined,
  currentLine: number,
  pointer: number,
  id?: string
) => {
  if (id) {
    const newLine = currentLine + 1;
    const newLinePointer = pointer + 1;
    console.log(
      "DEBUG SCAN - ID " +
        "[ " +
        id +
        " ]" +
        " found at " +
        "(" +
        newLine +
        ":" +
        newLinePointer +
        ")"
    );
    return;
  }
  if (token) {
    const newLine = currentLine + 1;
    const newLinePointer = pointer + 1;
    console.log(
      "DEBUG SCAN - " +
        "[ " +
        token +
        " ]" +
        " found at " +
        "(" +
        newLine +
        ":" +
        newLinePointer +
        ")"
    );
  }
};

const normalizeLexWithSpace = (lex: string) => lex + " ";
const normalizeLexWithEndl = (lex: string) => lex + "\n";

export const scanLexWithSpaceOrEndlLimitations = (
  currentStatus: LexycalAnalyzerStatus,
  currentWord: string,
  isId?: boolean
) => {
  const wordLength = currentWord.length;
  const wordValue = currentStatus.text.substring(
    currentStatus.currentPointer,
    peekChar(currentStatus.currentPointer, wordLength)
  );
  if (
    normalizeLexWithSpace(currentWord) === wordValue ||
    normalizeLexWithEndl(currentWord) === wordValue
  ) {
    if (isId) {
      logMessage(
        staticTokens.get("id"),
        currentStatus.currentLine,
        currentStatus.currentLinePointer,
        currentWord
      );
    } else {
      logMessage(
        staticTokens.get(currentWord),
        currentStatus.currentLine,
        currentStatus.currentLinePointer
      );
    }
    return {
      currentPointer: currentStatus.currentPointer + wordLength,
      currentLinePointer: currentStatus.currentLinePointer + wordLength,
      currentLine: currentStatus.currentLine,
      text: currentStatus.text,
    };
  }
};

export const scanLexWithoutLimitations = (
  currentStatus: LexycalAnalyzerStatus,
  currentWord: string
) => {
  const wordLength = currentWord.length;
  const wordValue = currentStatus.text.substring(
    currentStatus.currentPointer,
    peekChar(currentStatus.currentPointer, wordLength - 1)
  );
  if (currentWord === wordValue) {
    logMessage(
      staticTokens.get(currentWord),
      currentStatus.currentLine,
      currentStatus.currentLinePointer
    );
    return {
      currentPointer: currentStatus.currentPointer + wordLength,
      currentLinePointer: currentStatus.currentLinePointer + wordLength,
      currentLine: currentStatus.currentLine,
      text: currentStatus.text,
    };
  }
};

export const scanIdLex = (currentStatus: LexycalAnalyzerStatus) => {
  const id = extractId(currentStatus.text, currentStatus.currentPointer);
  const result = scanLexWithSpaceOrEndlLimitations(currentStatus, id, true);
  return result;
};

export const extractId = (text: string, position: number) => {
  let id = "";
  for (let i = position; i < text.length; i++) {
    if (text[i] !== " " && text[i] !== "\n") {
      id += text[i];
    } else {
      return id;
    }
  }
  return id;
};

export const findClosedScope = (
  currentStatus: LexycalAnalyzerStatus,
  closePattern: string
) => {
  let pointer = currentStatus.currentPointer;
  let text = currentStatus.text;

  for (let i = pointer; i < text.length; i++) {
    if (text[i] + text[peekChar(i, 0)] === closePattern) {
      logMessage(
        staticTokens.get(closePattern),
        currentStatus.currentLine,
        currentStatus.currentLinePointer + closePattern.length
      );
      return {
        currentPointer: i + closePattern.length,
        currentLinePointer: currentStatus.currentLinePointer,
        currentLine: currentStatus.currentLine,
        text: currentStatus.text,
      };
    }
    if (text[i] === "\n") {
      currentStatus.currentPointer++;
      currentStatus.currentLinePointer = 0;
      currentStatus.currentLine++;
    }
    currentStatus.currentLinePointer++;
  }
};
