module.exports = {
    "extends": "airbnb",
    "rules": {
      "strict": "off",
      "no-template-curly-in-string": "off",
      "import/no-extraneous-dependencies": ["off", {"devDependencies": ["**/*.test.js"]}]
    },
    "env": {
      "jest": true
    }
  };
