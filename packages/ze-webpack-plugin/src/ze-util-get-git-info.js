function getGitInfo() {
  try {
    const { execSync } = require('node:child_process');

    const username = execSync('git config user.name').toString().trim();
    const email = execSync('git config user.email').toString().trim();
    const remoteOrigin = execSync('git config --get remote.origin.url').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const commitHash = execSync('git rev-parse HEAD').toString().trim();

    // parse remote origin url to get the organization and repository name
    const urlParts = remoteOrigin
      .replace(/.+@/, '') // Remove the protocol (like https://) and user info
      .replace(/.git$/, '') // Remove the .git at the end
      .split(':') // Split at the colon to separate domain from path
      .pop() // Take the last part, which is the path
      .split('/'); // Split the path into parts

    const organization = urlParts.length > 1 ? urlParts[urlParts.length - 2] : null;
    const repositoryName = urlParts.length > 0 ? urlParts[urlParts.length - 1] : null;

    return {
      git: {
        name: username,
        email,
        branch,
        commit: commitHash,
      },
      app: {
        org: organization,
        project: repositoryName
      }
    };
  } catch (error) {
    console.error('Error retrieving Git information:', error);
    return null;
  }
}

module.exports = { getGitInfo };
