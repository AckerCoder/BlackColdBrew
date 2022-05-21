import { TokenLocalizer } from "./interfaces";
import { staticTokens } from "./tokens";

export class llparser {
  ntoken = 0;
  tokens;
  assignment = () => {
    if (this.tokens[this.ntoken] !== staticTokens.get("id")) {
      return false;
    }
    this.ntoken++;
    if (this.tokens[this.ntoken] !== staticTokens.get("=")) {
      return false;
    }
    this.ntoken++;
    return this.expression();
  };
  expression = () => {
    if (this.term()) {
      return this.expr_prime();
    }
    return false;
  };
  term = () => {
    return 1;
  };
  expr_prime = () => {
    return 1;
  };
  term_prime = () => {
    return 1;
  };
  factor = () => {};

  parse = () => {
    if (this.assignment()) {
      return true;
    }
    return false;
  };
}
