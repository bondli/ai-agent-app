module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
      "eslint: recommended",
      "plugin: react/recommended",
      "plugin: @typescript-eslint/recommended",
      "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "ecmaFeatures": {
          "jsx": true
      },
      "ecmaVersion": "latest",
      "sourceType": "module"
  },
  "plugins": [
      "prettier",
      "react",
      "@typescript-eslint",
      "import"
  ],
  "rules": {
      "@typescript-eslint/ban-ts-comment": "off",
      "no-useless-escape": "warn",
      "no-undef": [
          "error"
      ],
      "spaced-comment": [
          "error",
          "always"
      ],
      "space-before-blocks": [
          "error",
          "always"
      ],
      "no-multiple-empty-lines": [
          "error",
          {
              "max": 5
          }
      ],
      "no-mixed-spaces-and-tabs": [
          "error",
          false
      ],
      "comma-dangle": [
          "error",
          "only-multiline"
      ],
      "indent": [
          "error",
          2,
          {
              "SwitchCase": 1
          }
      ],
      "quotes": [
          "error",
          "single"
      ],
      "semi": [
          "error",
          "always"
      ],
      "@typescript-eslint/no-explicit-any": [
          "off"
      ],
      "no-irregular-whitespace": [
          "error",
          {
              "skipStrings": true,
              "skipComments": true,
              "skipRegExps": true,
              "skipTemplates": true
          }
      ],
      "no-multi-spaces": [
          "error",
          {
              "ignoreEOLComments": true
          }
      ],
      "no-trailing-spaces": [
          "error",
          {
              "skipBlankLines": false
          }
      ],
      "brace-style": [
          "error",
          "1tbs",
          {
              "allowSingleLine": false
          }
      ],
      "key-spacing": [
          "warn",
          {
              "beforeColon": false,
              "afterColon": true
          }
      ],
      "object-curly-spacing": [
          "error",
          "always"
      ],
      "array-bracket-spacing": [
          "error",
          "never"
      ],
      "max-lines": [
          "error",
          800
      ],
      "max-statements": [
          "error",
          100
      ],
      "import/first": [
          "error"
      ],
      "import/exports-last": [
          "error"
      ],
      "import/newline-after-import": [
          "error"
      ],
      "import/no-duplicates": [
          "error"
      ],
      "import/order": [
          "error",
          {
              "newlines-between": "never"
          }
      ]
  },
  "settings": {
      "react": {
          "version": "detect"
      }
  },
  "ignores": ["**/idea/*", "**/.DS_Store/*", "**/.vscode/*", "**/node_modules/*", "**/dist/*", "**/release/*", ".prettierrc.js"]
};