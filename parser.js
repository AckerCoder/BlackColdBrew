import { Tokenizer } from "./tokenizer.js";
class Parser {
  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.init(string);

    this._lookahead = this._tokenizer.getNextToken();
    console.log(this.Program().body[0].body);
    return this.Program();
  }

  Program() {
    return {
      type: "Program",
      body: this.StatementList(),
    };
  }

  StatementList(stopLookaheadTokenType = null) {
    const statementList = [];

    while (
      this._lookahead !== null &&
      this._lookahead.type !== stopLookaheadTokenType
    ) {
      let statement = this.Statement();
      statementList.push(statement);
    }

    return statementList;
  }

  Statement() {
    switch (this._lookahead.type) {
      case "if":
        return this.IfStatement();
      case "{":
        return this.BlockStatement();
      case "int":
        return this.IntegerStatement();
      case "string":
        return this.StringStatement();
      case "boolean":
        return this.BooleanStatement();
      case "while":
        return this.IterationStatement();
      case "print":
        return this.PrintStatement();
      case "read":
        return this.ReadStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  IterationStatement() {
    switch (this._lookahead.type) {
      case "while":
        return this.WhileStatement();
    }
  }

  WhileStatement() {
    this._consume("while");
    this._consume("(");
    const test = this.Expression();
    this._consume(")");

    const body = this.Statement();

    return {
      type: "WhileStatement",
      test,
      body,
    };
  }

  PrintStatement() {
    this._consume("print");
    this._consume("(");
    const test = this.Expression();
    this._consume(")");
    const body = this.Statement();
    return {
      type: "PrintStatement",
      test,
      body,
    };
  }

  ReadStatement() {
    this._consume("read");
    this._consume("(");
    const test = this.Expression();
    this._consume(")");
    const body = this.Statement();

    return {
      type: "ReadStatement",
      test,
      body,
    };
  }

  IfStatement() {
    this._consume("if");
    this._consume("(");
    const test = this.Expression();
    this._consume(")");

    const consequent = this.Statement();

    let alternate = null;

    if (this._lookahead !== null && this._lookahead.type === "else") {
      this._consume("else");
      alternate = this.Statement();
    }

    return {
      type: "IfStatement",
      test,
      consequent,
      alternate,
    };
  }

  VariableStatementInit() {
    this._consume("let");
    const declarations = this.VariableDeclarationList();

    return {
      type: "VariableStatement",
      declarations,
    };
  }

  /**
   * VariableStatement
   *  ;
   */

  StringStatement() {
    this._consume("string");
    const declarations = this.VariableDeclaration();

    return {
      type: "StringStatement",
      declarations,
    };
  }

  IntegerStatement() {
    this._consume("int");
    const declarations = this.VariableDeclaration();

    return {
      type: "IntegerStatement",
      declarations,
    };
  }

  BooleanStatement() {
    this._consume("boolean");
    const declarations = this.VariableDeclaration();

    return {
      type: "BooleanStatement",
      declarations,
    };
  }

  VariableDeclaration() {
    const id = this.Identifier();

    const init =
      this._lookahead.type === "SIMPLE_ASSIGN"
        ? this.VariableInitializer()
        : null;

    return {
      type: "VariableDeclaration",
      id,
      init,
    };
  }

  VariableInitializer() {
    this._consume("SIMPLE_ASSIGN");
    return this.AssignmentExpression();
  }

  BlockStatement() {
    this._consume("{");

    if (this._lookahead.type === "}") {
      // empty block statement
      return this._EmptyBlockStatement();
    }

    const body = this.StatementList("}");
    this._consume("}");
    // this._consume("$");

    return {
      type: "BlockStatement",
      body,
    };
  }

  _EmptyBlockStatement() {
    this._consume("}");
    return {
      type: "BlockStatement",
      body: [],
    };
  }

  ExpressionStatement() {
    const expression = this.Expression();

    return {
      type: "ExpressionStatement",
      expression,
    };
  }

  Expression() {
    return this.AssignmentExpression();
  }

  AssignmentExpression() {
    const left = this.LogicalOrExpression();

    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }

    return {
      type: "AssignmentExpression",
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    };
  }

  LogicalOrExpression() {
    return this._LogicalExpression("LogicalAndExpression", "LOGICAL_OR");
  }

  LogicalAndExpression() {
    return this._LogicalExpression("EqualityExpression", "LOGICAL_AND");
  }

  EqualityExpression() {
    return this._RightAssociativeBinaryExpression(
      "RelationalExpression",
      "EQUALITY_OPERATOR"
    );
  }

  RelationalExpression() {
    return this._RightAssociativeBinaryExpression(
      "AdditiveExpression",
      "RELATIONAL_OPERATOR"
    );
  }

  _isAssignmentOperator(tokenType) {
    return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN";
  }

  AssignmentOperator() {
    if (this._lookahead.type === "SIMPLE_ASSIGN") {
      return this._consume("SIMPLE_ASSIGN");
    } else {
      return this._consume("COMPLEX_ASSIGN");
    }
  }

  _checkValidAssignmentTarget(node) {
    if (node.type === "Identifier" || node.type === "MemberExpression") {
      return node;
    }

    throw new SyntaxError("Invalid left-hand side in assignment expression");
  }

  AdditiveExpression() {
    return this._RightAssociativeBinaryExpression(
      "MultiplicativeExpression",
      "ADDITIVE_OPERATOR"
    );
  }

  MultiplicativeExpression() {
    return this._RightAssociativeBinaryExpression(
      "UnaryExpression",
      "MULTIPLICATIVE_OPERATOR"
    );
  }

  _LogicalExpression(builderFuncionName, operatorTokenType) {
    const builderFunction = this[builderFuncionName];

    const bindedBuilderFunction = builderFunction.bind(this);

    let left = bindedBuilderFunction();

    while (this._lookahead.type === operatorTokenType) {
      const operator = this._consume(operatorTokenType).value;
      const right = bindedBuilderFunction();

      let node = {
        type: "LogicalExpression",
        operator,
        left,
        right,
      };
      left = node;
    }

    return left;
  }

  _RightAssociativeBinaryExpression(builderFuncionName, operatorTokenType) {
    const builderFunction = this[builderFuncionName];

    const bindedBuilderFunction = builderFunction.bind(this);

    let left = bindedBuilderFunction();

    while (this._lookahead.type === operatorTokenType) {
      const operator = this._consume(operatorTokenType).value;
      const right = bindedBuilderFunction();

      let node = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };

      left = node;
    }

    return left;
  }

  UnaryExpression() {
    let operator = null;
    switch (this._lookahead.type) {
      case "ADDITIVE_OPERATOR":
        operator = this._consume("ADDITIVE_OPERATOR").value;
        break;

      case "LOGICAL_NOT":
        operator = this._consume("LOGICAL_NOT").value;
        break;
    }

    if (operator === null) {
      return this.LeftHandSideExpression();
    } else {
      return {
        type: "UnaryExpression",
        operator,
        argument: this.UnaryExpression(),
      };
    }
  }

  LeftHandSideExpression() {
    return this.CallOrMemberExpression();
  }

  CallOrMemberExpression() {
    const member = this.MemberExpression();

    if (this._lookahead.type === "(") {
      return this._CallExpression(member);
    } else {
      return member;
    }
  }
  _CallExpression(callee) {
    let callExpression = {
      type: "CallExpression",
      callee,
      arguments: this.Arguments(),
    };

    while (this._lookahead.type === "(") {
      callExpression = {
        type: "CallExpression",
        callee: callExpression,
        arguments: this.Arguments(),
      };
    }

    return callExpression;
  }

  Arguments() {
    this._consume("(");
    const argumentList =
      this._lookahead.type === ")" ? [] : this.ArgumentList();
    this._consume(")");

    return argumentList;
  }
  ArgumentList() {
    let argumentList = [];

    argumentList.push(this.Expression());

    while (this._lookahead.type === "," && this._consume(",")) {
      argumentList.push(this.Expression());
    }

    return argumentList;
  }

  MemberExpression() {
    let object = this.PrimaryExpression();

    while (this._lookahead.type === "." || this._lookahead.type === "[") {
      switch (this._lookahead.type) {
        case ".": {
          this._consume(".");
          const property = this.Identifier();

          object = {
            type: "MemberExpression",
            computed: false,
            object,
            property,
          };
          break;
        }
        case "[": {
          this._consume("[");
          const property = this.Expression();
          this._consume("]");

          object = {
            type: "MemberExpression",
            computed: true,
            object,
            property,
          };
          break;
        }
      }
    }

    return object;
  }

  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }

    switch (this._lookahead.type) {
      case "(":
        return this.ParenthesizedOrTupleExpression();
      case "[":
        return this.ListExpression();
      case "#{":
        return this.MapExpression();
      case "IDENTIFIER":
        return this.Identifier();
      case "new":
        return this.NewExpression();
    }
  }
  NewExpression() {
    this._consume("new");
    return {
      type: "NewExpression",
      callee: this.MemberExpression(),
      arguments: this.Arguments(),
    };
  }

  _isLiteral(tokenType) {
    return (
      tokenType === "STRING" ||
      tokenType === "NUMBER" ||
      tokenType === "TRUE" ||
      tokenType === "FALSE" ||
      tokenType === "NULL"
    );
  }

  Identifier() {
    const name = this._consume("IDENTIFIER").value;
    return {
      type: "Identifier",
      name,
    };
  }

  ParenthesizedOrTupleExpression() {
    this._consume("(");

    if (this._lookahead.type === ")") {
      // empty tuple
      return this._EmptyTuple();
    }

    const element = this.Expression();

    return this._ParenthesizedExpression(element);
  }

  _ParenthesizedExpression(firstElement) {
    this._consume(")");
    return firstElement;
  }

  Literal() {
    switch (this._lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
      case "TRUE":
        return this.BooleanLiteral(true);
      case "FALSE":
        return this.BooleanLiteral(false);
      case "NULL":
        return this.NullLiteral();
    }
    throw new SyntaxError(`Literal: unexcepted literal production`);
  }

  StringLiteral() {
    const token = this._consume("STRING");

    return {
      type: "StringLiteral",
      // TODO:: unescape the '\\', '\"', '\n' ... etc
      value: token.value.substring(1, token.value.length - 1),
    };
  }

  NumericLiteral() {
    const token = this._consume("NUMBER");

    return {
      type: "NumericLiteral",
      value: Number(token.value),
    };
  }

  BooleanLiteral(value) {
    this._consume(value ? "TRUE" : "FALSE");
    return {
      type: "BooleanLiteral",
      value: value,
    };
  }

  _consume(tokenType) {
    const token = this._lookahead;

    if (token === null) {
      throw new SyntaxError(
        `Unexpected end of input, excepted: "${tokenType}"`
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", excepted: "${tokenType}"`
      );
    }

    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }
}

export { Parser };
