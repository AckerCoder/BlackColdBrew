import { TokenLocalizer } from "./interfaces";
import { staticTokens } from "./tokens";

export const parser = (tokenList: Array<TokenLocalizer>) => {
  for (let i = 0; i < tokenList.length; i++) {
    switch (tokenList[i].token) {
      case staticTokens.get("="):
        if (i === 0) return false;
        if (tokenList[i - 1].token === staticTokens.get("id")) return false;
      case staticTokens.get("id"):
      case staticTokens.get("int"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("string"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("boolean"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("/"):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("*"):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("-"):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("+"):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("=="):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("!="):
        if (i === 0) return false;
        if (i === tokenList.length - 1) return false;
        if (tokenList[i - 1].token !== staticTokens.get("id")) return false;
        if (tokenList[i + 1].token !== staticTokens.get("id")) return false;
      case staticTokens.get("/*"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("*/")) return false;
      case staticTokens.get("*/"):
        if (i === 0) return false;
        if (tokenList[i - 1].token !== staticTokens.get("/*")) return false;
      case staticTokens.get("{"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("}")) return false;
      case staticTokens.get("}"):
        if (i === 0) return false;
        if (tokenList[i - 1].token !== staticTokens.get("{")) return false;
      case staticTokens.get("("):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get(")")) return false;
      case staticTokens.get(")"):
        if (i === 0) return false;
        if (tokenList[i - 1].token !== staticTokens.get("(")) return false;
      case staticTokens.get("$"):
      case staticTokens.get("“"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("”")) return false;
      case staticTokens.get("”"):
        if (i === 0) return false;
        if (tokenList[i - 1].token !== staticTokens.get("“")) return false;
      case staticTokens.get("print"):
        if (i === tokenList.length - 1) return false;
        if (tokenList[i + 1].token !== staticTokens.get("(")) return false;
    }
  }
};
