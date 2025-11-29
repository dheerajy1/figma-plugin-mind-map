export default {
  branches: ["main", { name: 'test/staging', prerelease: 'rc' },],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    "@semantic-release/github"
  ]
};