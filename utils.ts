import { Error, TokenLocalizer } from "./interfaces";

const isTokenUndefined = (tokenLocalizer: TokenLocalizer) =>
  tokenLocalizer.token !== undefined;

export const peekChar = (currentPosition: number, wordLength: number) =>
  currentPosition + wordLength + 1;

export const createError = (message: string): Error => {
  return {
    message: message,
  };
};

export const normalizeLexWithSpace = (lex: string) => lex + " ";
export const normalizeLexWithEndl = (lex: string) => lex + "\n";

export const cleanTokenList = (tokenList: Array<TokenLocalizer>) =>
  tokenList.filter(isTokenUndefined);
