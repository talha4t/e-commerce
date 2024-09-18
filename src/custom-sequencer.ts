const TestSequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    const order = ["auth", "product", "cart", "order"];

    console.log("Sorting tests in the following order:");
    tests.forEach((test) => {
      console.log(`Test path: ${test.path}`);
    });

    return tests.sort((a, b) => {
      const aIndex = order.findIndex((name) => a.path.includes(name));
      const bIndex = order.findIndex((name) => b.path.includes(name));

      return aIndex - bIndex;
    });
  }
}

module.exports = CustomSequencer;
