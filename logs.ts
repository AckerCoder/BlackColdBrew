export const logMessage = (
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

export const logError = (token: string) => {
  console.log("ERROR FOUND - EXPECTED " + token);
};
