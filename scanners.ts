import { LexycalAnalyzerStatus } from "./interfaces";
import { staticTokens } from "./tokens";
import {
  peekChar,
  normalizeLexWithEndl,
  normalizeLexWithSpace,
  createError,
} from "./utils";
import { logMessage } from "./logs";
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
  return {
    currentPointer: closePattern.length,
    currentLinePointer: currentStatus.currentLinePointer,
    currentLine: currentStatus.currentLine,
    text: currentStatus.text,
    error: createError("EXPECTED " + staticTokens.get(closePattern)),
  };
};
