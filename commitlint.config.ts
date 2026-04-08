import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "docs", // documentation only
        "style", // formatting, no logic change
        "refactor", // code change that neither fixes a bug nor adds a feature
        "perf", // performance improvement
        "test", // adding or updating tests
        "chore", // build process, dependency updates, tooling
        "ci", // CI/CD configuration
        "revert", // reverts a previous commit
        "build", // changes affecting build system
        "db", // prisma schema or migrations
        "infra", // docker, deployment, infrastructure
      ],
    ],
    "scope-case": [2, "always", "kebab-case"],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 150],
    "footer-max-line-length": [2, "always", 150],
  },
};

export default config;
