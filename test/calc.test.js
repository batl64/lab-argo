const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { evaluate, MAX_LENGTH } = require("../calc");

describe("evaluate: арифметика", () => {
  const cases = [
    ["2+3", 5],
    ["10-4", 6],
    ["6*7", 42],
    ["8/2", 4],
    ["10%3", 1],
    ["2^10", 1024],
    ["  1 + 2  ", 3],
  ];
  for (const [expr, expected] of cases) {
    test(`${expr} = ${expected}`, () => assert.equal(evaluate(expr), expected));
  }
});

describe("evaluate: пріоритет та дужки", () => {
  test("множення раніше додавання", () => assert.equal(evaluate("2+3*4"), 14));
  test("дужки змінюють порядок", () => assert.equal(evaluate("(2+3)*4"), 20));
  test("вкладені дужки", () => assert.equal(evaluate("((1+2)*(3+4))"), 21));
  test("степінь правоасоціативний", () => assert.equal(evaluate("2^3^2"), 512));
  test("степінь вищий за множення", () => assert.equal(evaluate("2*3^2"), 18));
  test("складний вираз", () =>
    assert.equal(evaluate("0.1+0.2*(3-1)^2/4"), 0.3));
});

describe("evaluate: унарні оператори", () => {
  test("унарний мінус", () => assert.equal(evaluate("-5+2"), -3));
  test("подвійний мінус", () => assert.equal(evaluate("--5"), 5));
  test("мінус перед дужкою", () => assert.equal(evaluate("-(2+3)"), -5));
  test("від’ємний степінь", () => assert.equal(evaluate("2^-1"), 0.5));
  test("унарний плюс", () => assert.equal(evaluate("+4"), 4));
});

describe("evaluate: числа та формат", () => {
  test("десятковий дріб", () => assert.equal(evaluate("1.5*2"), 3));
  test("кома як роздільник", () => assert.equal(evaluate("1,5+1,5"), 3));
  test("число без цілої частини", () => assert.equal(evaluate(".5+.5"), 1));
  test("число з крапкою в кінці", () => assert.equal(evaluate("5.+2"), 7));
  test("експоненційний запис", () => assert.equal(evaluate("2e3"), 2000));
  test("символи × та ÷", () => assert.equal(evaluate("6×3÷2"), 9));
  test("похибка float прибрана", () => assert.equal(evaluate("0.1+0.2"), 0.3));
  test("приймає число, а не рядок", () => assert.equal(evaluate(42), 42));
});

describe("evaluate: помилки", () => {
  const bad = [
    ["1/0", "Ділення на нуль"],
    ["5%0", "Ділення на нуль"],
    ["1/(2-2)", "Ділення на нуль"],
    ["(1+2", "Не закрито дужку"],
    ["1+2)", "Некоректний вираз"],
    ["1+", "Некоректний вираз"],
    ["*3", "Некоректний вираз"],
    ["abc", "Некоректний вираз"],
    ["2(3)", "Некоректний вираз"],
    ["1..2", "Некоректний вираз"],
    ["", "Некоректний вираз"],
    ["   ", "Некоректний вираз"],
    ["1e999", "Результат поза межами"],
    ["9^9^9", "Результат поза межами"],
  ];
  for (const [expr, message] of bad) {
    test(`"${expr}" → ${message}`, () => {
      assert.throws(() => evaluate(expr), { message });
    });
  }

  test("надто довгий вираз", () => {
    assert.throws(() => evaluate("1+".repeat(MAX_LENGTH)), {
      message: "Некоректний вираз",
    });
  });

  test("не виконує довільний код", () => {
    assert.throws(() => evaluate("process.exit(1)"), {
      message: "Некоректний вираз",
    });
    assert.throws(() => evaluate('require("fs")'), {
      message: "Некоректний вираз",
    });
  });
});
