export interface TokenLocalizer {
  token: string | undefined;
  line: number;
  linePointer: number;
}

export interface LexycalAnalyzerStatus {
  currentPointer: number;
  currentLinePointer: number;
  currentLine: number;
  text: string;
  error?: Error;
  tokenList: Array<TokenLocalizer>;
}

export interface Error {
  message: string;
}
