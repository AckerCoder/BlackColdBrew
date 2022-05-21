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

    const newTokenList = currentStatus.tokenList;

    newTokenList.push({
      line: currentStatus.currentLine,
      linePointer: currentStatus.currentLinePointer,
      token: staticTokens.get(currentWord),
    });

    return {
      currentPointer: currentStatus.currentPointer + wordLength,
      currentLinePointer: currentStatus.currentLinePointer + wordLength,
      currentLine: currentStatus.currentLine,
      text: currentStatus.text,
      tokenList: newTokenList,
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

    const newTokenList = currentStatus.tokenList;

    newTokenList.push({
      line: currentStatus.currentLine,
      linePointer: currentStatus.currentLinePointer,
      token: staticTokens.get(currentWord),
    });

    return {
      currentPointer: currentStatus.currentPointer + wordLength,
      currentLinePointer: currentStatus.currentLinePointer + wordLength,
      currentLine: currentStatus.currentLine,
      text: currentStatus.text,
      tokenList: newTokenList,
    };
  }
};

export const scanIdLex = (currentStatus: LexycalAnalyzerStatus) => {
  const id = extractId(currentStatus.text, currentStatus.currentPointer);
  const result = scanLexWithSpaceOrEndlLimitations(currentStatus, id, true);
  const newTokenList = currentStatus.tokenList;

  newTokenList.push({
    line: currentStatus.currentLine,
    linePointer: currentStatus.currentLinePointer,
    token: "ID",
  });
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
      const newTokenList = currentStatus.tokenList;

      newTokenList.push({
        line: currentStatus.currentLine,
        linePointer: currentStatus.currentLinePointer,
        token: staticTokens.get(closePattern),
      });

      return {
        currentPointer: i + closePattern.length,
        currentLinePointer: currentStatus.currentLinePointer,
        currentLine: currentStatus.currentLine,
        text: currentStatus.text,
        tokenList: newTokenList,
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
    tokenList: currentStatus.tokenList,
  };
};
