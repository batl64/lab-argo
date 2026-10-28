// Безпечний обчислювач виразів (без eval).
// Граматика: expr = term (('+'|'-') term)*; term = power (('*'|'/'|'%') power)*;
// power = unary ('^' power)?; unary = '-' unary | primary; primary = число | '(' expr ')'
const MAX_LENGTH = 200;

function evaluate(src) {
  const s = String(src)
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, ".");
  if (!s || s.length > MAX_LENGTH) throw new Error("Некоректний вираз");
  let i = 0;
  const peek = () => s[i];

  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-")
      v = s[i++] === "+" ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = power();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = s[i++];
      const r = power();
      if (op === "*") v *= r;
      else if (r === 0) throw new Error("Ділення на нуль");
      else v = op === "/" ? v / r : v % r;
    }
    return v;
  }
  function power() {
    const base = unary();
    if (peek() === "^") {
      i++;
      return Math.pow(base, power());
    }
    return base;
  }
  function unary() {
    if (peek() === "-") {
      i++;
      return -unary();
    }
    if (peek() === "+") {
      i++;
      return unary();
    }
    return primary();
  }
  function primary() {
    if (peek() === "(") {
      i++;
      const v = expr();
      if (peek() !== ")") throw new Error("Не закрито дужку");
      i++;
      return v;
    }
    const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
    if (!m) throw new Error("Некоректний вираз");
    i += m[0].length;
    return parseFloat(m[0]);
  }

  const result = expr();
  if (i < s.length) throw new Error("Некоректний вираз");
  if (!Number.isFinite(result)) throw new Error("Результат поза межами");
  return Math.round(result * 1e12) / 1e12; // 0.1+0.2 → 0.3
}

module.exports = { evaluate, MAX_LENGTH };
