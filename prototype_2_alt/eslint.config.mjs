import config from "eslint-config-lostfictions";
export default [
  ...config,
  {
    rules: {
      // might remove these from core later, too annoying
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",

      "no-restricted-globals": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "all",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "_config|_init|_update|_draw",
        },
      ],
    },
  },
];
