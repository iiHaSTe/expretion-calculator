class Token {
  constructor(public type: string, public value: string | undefined) { }
}

class ASTNode {
  constructor(public type: string) { }
}

class NumberNode extends ASTNode {
  constructor(public value: number) {
    super('Number');
  }
}

class BinaryOpNode extends ASTNode {
  constructor(public left: ASTNode, public operator: string, public right: ASTNode) {
    super('BinaryOp');
  }
}

function tokenize(expretion: string): Token[] {
  const result: Token[] = [];
  let currentNumber = "";
  for (let i of expretion) {
    if (/\d/.test(i) || i == '.')
      currentNumber += i;
    else if (i === '^' || i === '+' || i === '-' || i === '/' || i === '*') {
      if (currentNumber.length > 0)
        result.push(new Token("Number", currentNumber));
      currentNumber = "";
      result.push(new Token(i, i));
    }
    else if (i === '(')
      result.push(new Token(i, undefined));
    else if (i === ')') {
      if (currentNumber.length > 0)
        result.push(new Token("Number", currentNumber));
      currentNumber = '';
      result.push(new Token(i, undefined));
    }
  }
  if (currentNumber.length > 0) result.push(new Token("Number", currentNumber));
  return result;
}

function parsing(tokens: Token[]): ASTNode {
  let current = 0;

  function parseExpression(): ASTNode {
    let left = parseTerm();

    while (match(['+', '-'])) {
      const operator = previous();
      const right = parseTerm();
      left = new BinaryOpNode(left, operator.value, right);
    }

    return left;
  }

  function parseTerm(): ASTNode {
    let left = parseFactor();

    while (match(['*', '/', '^'])) {
      const operator = previous();
      const right = parseFactor();
      left = new BinaryOpNode(left, operator.value, right);
    }

    return left;
  }

  function parseFactor(): ASTNode {
    if (match(['Number'])) {
      return new NumberNode(Number(previous().value));
    }

    if (match(['('])) {
      const expr = parseExpression();
      consume(')', 'Expect closing parenthesis after expression.');
      return expr;
    }

    throw new Error('Invalid expression.');
  }

  function match(types: string[]): boolean {
    if (current < tokens.length) {
      const token = tokens[current];
      if (types.includes(token.type)) {
        current++;
        return true;
      }
    }
    return false;
  }

  function consume(type: string, message: string) {
    if (match([type])) return;
    throw new Error(message);
  }

  function previous(): Token {
    return tokens[current - 1];
  }

  return parseExpression();
}

function execute(tree: ASTNode): number {
  if (tree.type == "Number")
    return (tree as NumberNode).value;
  let left = execute((tree as BinaryOpNode).left);
  let right = execute((tree as BinaryOpNode).right);
  switch ((tree as BinaryOpNode).operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    case '^':
      return left ** right;
  }
}

let expretion = "2 * (3 + 4) - 6 / (2 * (5 - 2))";

let tokens = tokenize(expretion);
console.log(tokens);

let tree = parsing(tokens);
console.log(tree);

let result = execute(tree);
console.log(result);

