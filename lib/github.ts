import { Octokit } from "octokit";

let octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokit) {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  return octokit;
}

export function getRepoConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER as string,
    repo: process.env.GITHUB_REPO_NAME as string,
  };
}
