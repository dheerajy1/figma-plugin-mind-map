export default {
  branches: ["main", "test-release"],
  tagFormat: process.env.IS_PROD ? 'v${version}' : null,
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }]
  ]
};