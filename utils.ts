import { Error } from "./interfaces";

export const peekChar = (currentPosition: number, wordLength: number) =>
  currentPosition + wordLength + 1;

export const createError = (message: string): Error => {
  return {
    message: message,
  };
};

export const normalizeLexWithSpace = (lex: string) => lex + " ";
export const normalizeLexWithEndl = (lex: string) => lex + "\n";
