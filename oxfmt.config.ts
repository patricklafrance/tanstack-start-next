import { defineConfig } from "oxfmt";

export default defineConfig({
    ignorePatterns: [".agents/skills", ".claude/skills", "skills-lock.json"],
    printWidth: 150,
    tabWidth: 4,
    singleQuote: false,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: "none",
    arrowParens: "avoid",
    bracketSpacing: true,
    bracketSameLine: false,
    quoteProps: "as-needed",
    sortTailwindcss: {},
    sortPackageJson: {
        sortScripts: false
    }
});
