function calculator(expression) {
  try {
    const result = eval(expression);

    return result;
  } catch (error) {
    return "Invalid calculation";
  }
}

module.exports = calculator;