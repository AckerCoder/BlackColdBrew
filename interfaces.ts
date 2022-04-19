export interface LexycalAnalyzerStatus {
  currentPointer: number;
  currentLinePointer: number;
  currentLine: number;
  text: string;
  error?: Error;
}

export interface Error {
  message: string;
}
