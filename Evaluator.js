import { Tokenizer } from "./tokenizer.js";

const JSInterpreter = (tokens) => {
	let program = "";
	for (let i = 0; i < tokens.length; i++) {
		let currentStatement = tokens[i];
		// console.log(tokens);
		if (currentStatement.type === "IntegerStatement") {
			program += "let ";
			program += currentStatement.declarations.id.name;
			if (currentStatement.declarations.init) {
				program += "=";
				program += JSInterpreter([currentStatement.declarations.init]);
			}
			program += ";\n";
		}
		if (currentStatement.type === "StringStatement") {
			program += "let ";
			program += currentStatement.declarations.id.name;
			if (currentStatement.declarations.init) {
				program += "=";
				program += JSInterpreter([currentStatement.declarations.init]);
			}
			program += ";\n";
		}

		if (currentStatement.type === "BooleanStatement") {
			program += "let ";
			program += currentStatement.declarations.id.name;
			if (currentStatement.declarations.init) {
				program += "=";
				program += JSInterpreter([currentStatement.declarations.init]);
			}
			program += ";\n";
		}

		if (currentStatement.type === "PrintStatement") {
			program += "console.log(";
			program += currentStatement.test.name;
			program += ");\n";
		}
		if (currentStatement.type === "WhileStatement") {
			program += "while(";
			program += currentStatement.test.value;
			program += "){\n";
			program += JSInterpreter(currentStatement.body.body);
			program += "}\n";
		}

		if (currentStatement.type === "ExpressionStatement") {
			program += JSInterpreter([currentStatement?.expression?.left]);
			program += currentStatement?.expression.operator + " ";
			program += JSInterpreter([currentStatement?.expression?.right]);
			program += ";\n";
		}

		if (currentStatement.type === "Identifier") {
			program += currentStatement.name;
			program += " ";
		}

		if (currentStatement.type === "NumericLiteral") {
			program += currentStatement.value;
			program += " ";
		}
	}
	return program;
};

class Parser {
	constructor() {
		this._string = "";
		this._tokenizer = new Tokenizer();
	}

	// parses a string into an AST.
	parse(string) {
		this._string = string;
		this._tokenizer.init(string);

		this._lookahead = this._tokenizer.getNextToken();
		// console.log(this.Program().body[0].body);

		console.log(JSInterpreter(this.Program().body[0].body));

		return this.Program();
	}

	/**
	 * Main entry point
	 *
	 * Program
	 *  : StatementList
	 *  ;
	 */
	Program() {
		return {
			type: "Program",
			body: this.StatementList(),
		};
	}

	/**
	 * StatementList
	 *  : Statement
	 *  | StatementList Statement
	 *  ;
	 */
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

	/**
	 * Statement
	 *  : ExpressionStatement
	 *  | BlockStatement
	 *  | EmptyStatement
	 *  | VariableStatement
	 *  | IterationStatement
	 *  ;
	 */
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

	/**
	 * IterationStatement
	 *  : WhileStatement
	 */
	IterationStatement() {
		switch (this._lookahead.type) {
			case "while":
				return this.WhileStatement();
		}
	}

	/**
	 * WhileStatement
	 *  : 'while' '(' Expression ')' Statement
	 *  ;
	 */
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
	/**
	 * IfStatement
	 *  : 'if' '(' Expression ')' Statement
	 *  | 'if' '(' Expression ')' Statement 'else' Statement
	 *  ;
	 */
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

	/**
	 * VariableStatementInit
	 *  | 'int'
	 *  | 'string'
	 *  | 'boolean'
	 *  ;
	 */
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

		// const init = this._lookahead.type !== ';' && this._lookahead.type !== ',' ?
		//     this.VariableInitializer() : null;

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

	/**
	 * VariableInitializer
	 *  : SIMPLE_ASSIGN AssignmentExpression
	 *  ;
	 */
	VariableInitializer() {
		this._consume("SIMPLE_ASSIGN");
		return this.AssignmentExpression();
	}

	/**
	 * BlockStatement
	 *  : '{' OptionalStatementList  '}'
	 *  ;
	 */
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

	/**
	 * ExpressionStatement
	 *  : Expression ';'
	 *  ;
	 */
	ExpressionStatement() {
		const expression = this.Expression();

		return {
			type: "ExpressionStatement",
			expression,
		};
	}

	/**
	 * Expression
	 *  : AssignmentExpression
	 * ;
	 */
	Expression() {
		// 表达式的解析顺序由优先级（precedence）低到高解析
		// 参考
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

		return this.AssignmentExpression();
	}

	/**
	 * AssignmentExpression
	 *  : LogicalOrExpression
	 *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
	 *  ;
	 */
	AssignmentExpression() {
		const left = this.LogicalOrExpression();

		// todo::
		// if (this._lookahead === null) ... // excepted ';'

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

	/**
	 * LogicalOrExpression
	 *  : LogicalAndExpression
	 *  | LogicalOrExpression LOGICAL_OR LogicalAndExpression
	 *  ;
	 */
	LogicalOrExpression() {
		return this._LogicalExpression("LogicalAndExpression", "LOGICAL_OR");
	}

	/**
	 * LogicalAndExpression
	 *  : EqualityExpression
	 *  | LogicalAndExpression LOGICAL_AND EqualityExpression
	 *  ;
	 */
	LogicalAndExpression() {
		return this._LogicalExpression("EqualityExpression", "LOGICAL_AND");
	}

	/**
	 * EqualityExpression
	 *  : RelationalExpression
	 *  | EqualityExpression EQUALITY_OPERATOR RelationalExpression
	 *  ;
	 */
	EqualityExpression() {
		return this._RightAssociativeBinaryExpression(
			"RelationalExpression",
			"EQUALITY_OPERATOR"
		);
	}

	/**
	 * RelationalExpression
	 *  : AdditiveExpression
	 *  | RelationalExpression RELATIONAL_OPERATOR AdditiveExpression
	 *  ;
	 */
	RelationalExpression() {
		return this._RightAssociativeBinaryExpression(
			"AdditiveExpression",
			"RELATIONAL_OPERATOR"
		);
	}

	_isAssignmentOperator(tokenType) {
		return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN";
	}

	/**
	 * AssignmentOperator
	 *  : SIMPLE_ASSIGN
	 *  | COMPLEX_ASSIGN
	 *  ;
	 * @returns
	 */
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

	/**
	 * AdditiveExpression
	 *  : MultiplicativeExpression
	 *  | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression
	 */
	AdditiveExpression() {
		return this._RightAssociativeBinaryExpression(
			"MultiplicativeExpression",
			"ADDITIVE_OPERATOR"
		);
	}

	/**
	 * MultiplicativeExpression
	 *  : UnaryExpression
	 *  | MultiplicativeExpression MULTIPLICATIVE_OPERATOR UnaryExpression
	 */
	MultiplicativeExpression() {
		return this._RightAssociativeBinaryExpression(
			"UnaryExpression",
			"MULTIPLICATIVE_OPERATOR"
		);
	}

	_LogicalExpression(builderFuncionName, operatorTokenType) {
		const builderFunction = this[builderFuncionName];

		// bind the 'this' value to the funcion
		// or, invoke the builder function with 'call' or 'apply' method.
		const bindedBuilderFunction = builderFunction.bind(this);

		let left = bindedBuilderFunction();

		// todo::
		// if (this._lookahead === null) ... // excepted ';'

		while (this._lookahead.type === operatorTokenType) {
			const operator = this._consume(operatorTokenType).value;
			const right = bindedBuilderFunction();

			let node = {
				type: "LogicalExpression",
				operator,
				left,
				right,
			};

			// left-to-right associative
			left = node;
		}

		return left;
	}

	_RightAssociativeBinaryExpression(builderFuncionName, operatorTokenType) {
		const builderFunction = this[builderFuncionName];

		// bind the 'this' value to the funcion
		// or, invoke the builder function with 'call' or 'apply' method.
		const bindedBuilderFunction = builderFunction.bind(this);

		let left = bindedBuilderFunction();

		// todo::
		// if (this._lookahead === null) ... // excepted ';'

		while (this._lookahead.type === operatorTokenType) {
			const operator = this._consume(operatorTokenType).value;
			const right = bindedBuilderFunction();

			let node = {
				type: "BinaryExpression",
				operator,
				left,
				right,
			};

			// left-to-right associative
			left = node;
		}

		return left;
	}

	/**
	 * UnaryExpression
	 *  : LeftHandSideExpression
	 *  | ADDITIVE_OPERATOR UnaryExpression
	 *  | LOGICAL_NOT UnaryExpression
	 *  ;
	 */
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
				argument: this.UnaryExpression(), // this will enable the unary chain, e.g. `!!true`
			};
		}
	}

	/**
	 * LeftHandSideExpression
	 *  : CallOrMemberExpression
	 *  ;
	 */
	LeftHandSideExpression() {
		return this.CallOrMemberExpression();
	}

	/**
	 * CallOrMemberExpression
	 *  : MemberExpression
	 *  | CallExpression
	 *  ;
	 */
	CallOrMemberExpression() {
		const member = this.MemberExpression();

		if (this._lookahead.type === "(") {
			return this._CallExpression(member);
		} else {
			return member;
		}
	}

	/**
	 * CallExpression
	 *  : Callee Arguments
	 *  ;
	 *
	 * Callee
	 *  : MemberExpression
	 *  | CallExpression
	 *  ;
	 */
	_CallExpression(callee) {
		let callExpression = {
			type: "CallExpression",
			callee,
			arguments: this.Arguments(),
		};

		while (this._lookahead.type === "(") {
			// callExpression = this._CallExpression(callExpression);
			// .or.

			callExpression = {
				type: "CallExpression",
				callee: callExpression,
				arguments: this.Arguments(),
			};
		}

		return callExpression;
	}

	/**
	 * Arguments
	 *  : '(' OptionalArgumentList ')'
	 *  ;
	 */
	Arguments() {
		this._consume("(");
		const argumentList =
			this._lookahead.type === ")" ? [] : this.ArgumentList();
		this._consume(")");

		return argumentList;
	}

	/**
	 * ArgumentList
	 *  : Expression
	 *  | ArgumentList ',' Expression
	 *  ;
	 */
	ArgumentList() {
		let argumentList = [];

		argumentList.push(this.Expression());

		while (this._lookahead.type === "," && this._consume(",")) {
			argumentList.push(this.Expression());
		}

		return argumentList;
	}

	/**
	 * MemberExpression
	 *  : PrimaryExpression
	 *  | MemberExpression '.' Identifier
	 *  | MemberExpression '[' Expression ']'
	 *  ;
	 */
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

	/**
	 * PrimaryExpression
	 *  : Literal
	 *  | ParenthesizedExpression
	 *  | Tuple
	 *  | List
	 *  | Map
	 *  | Identifier
	 *  | NewExpression
	 *  ;
	 */
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

	/**
	 * NewExpression
	 *  : 'new' MemberExpression Arguments
	 *  ;
	 */
	NewExpression() {
		// new 操作符的优先级
		//
		// 1. new 的优先级比 member 要高。
		// new Foo.bar(1) -> new (Foo.bar)(1)
		//
		// 2. new ...()... 比 new ... 的优先级要高。
		// new Foo(1).bar(2) -> (new Foo(1)).bar(2)
		// new new Foo(1).bar(2) -> (new (new Foo(1)).bar)(2)
		//
		// 参考
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

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

	/**
	 * Identifier
	 *  : IDENTIFIER
	 *  ;
	 */
	Identifier() {
		const name = this._consume("IDENTIFIER").value;
		return {
			type: "Identifier",
			name,
		};
	}

	/**
	 * ParenthesizedExpression
	 *  : '(' Expression ')'
	 *  ;
	 *
	 * TupleExpression
	 *  : '(' OptionalTupleElements ')'
	 *  ;
	 *
	 * TupleElements
	 *  : Expression OptionalComma
	 *  | TupleElements ',' Expression OptionalComma
	 *  ;
	 *
	 */
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

	/**
	 * Literal
	 *  : NumericLiteral
	 *  | StringLiteral
	 *  | TrueLiteral
	 *  | FalseLiteral
	 *  | NullLiteral
	 *  ;
	 */
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

	/**
	 * StringLiteral
	 *  : STRING
	 *  ;
	 */
	StringLiteral() {
		const token = this._consume("STRING");

		return {
			type: "StringLiteral",
			// TODO:: unescape the '\\', '\"', '\n' ... etc
			value: token.value.substring(1, token.value.length - 1),
		};
	}

	/**
	 * NumericLiteral
	 *  : NUMBER
	 *  ;
	 */
	NumericLiteral() {
		const token = this._consume("NUMBER");

		return {
			type: "NumericLiteral",
			value: Number(token.value),
		};
	}

	/**
	 * BooleanLiteral
	 *  : TRUE
	 *  | FALSE
	 *  ;
	 */
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

		// advance to next token
		this._lookahead = this._tokenizer.getNextToken();

		return token;
	}
}

export { Parser };
