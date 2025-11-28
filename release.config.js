export default {
  branches: ["main", "test-release"],
  tagFormat: 'v${version}',
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    // Conditionally include git plugin only for main branch
    ...(process.env.IS_PROD === 'true' ? [
      ["@semantic-release/git", {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }]
    ] : [])
  ]
};