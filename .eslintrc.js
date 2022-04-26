module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules":{
        "prettier/prettier":"error",
        "no-useless-constructor":"off",
        "no-unused-vars":"off",
        "camelcase":"off",
        "@typescript-eslint/no-unused-vars":[
           "warn",
           {
              "argsIgnorePattern":"^_"
           }
        ],
        "@typescript-eslint/naming-convention":[
           "error",
           {
              "selector":"interface",
              "format":[
                 "PascalCase"
              ],
              "custom":{
                 "regex":"^I[A-Z]",
                 "match":true
              }
           }
        ],
        "class-methods-use-this":"off",
        "import/extensions":"off"
     },
     "settings":{
        "import/resolver":{
           "typescript":{
              
           }
        }
     }
}
