import * as core from '@actions/core';
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

async function run() {
  try {
    const githubToken = core.getInput('github-token');
    const repo = core.getInput('repo');
    const org = core.getInput('org');
    const sha = core.getInput('sha');
    const pathToLcov = core.getInput('path-to-lcov');
    const basePath = core.getInput('base-path');

    if (!githubToken || githubToken == '') {
      throw new Error("'github-token' is missing; make sure your job specifies it with 'github-token: ${{ secrets.github_token }}'");
    }

    let file;
    try {
      file = fs.readFileSync(pathToLcov, 'utf8');
    } catch (err) {
      throw new Error("Lcov file not found.");
    }

    const adjustedFile = basePath ? adjustLcovBasePath(file, basePath) : file;

    await fetch(
      "https://api.graphite.dev/external/v1/graphite/code-coverage/upload",
      {
        method: "POST",
        body: JSON.stringify({
          org,
          repo,
          sha,
          githubToken,
          lcov: adjustedFile,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    core.setFailed(error.message);
  }

  return 0;
}

/**
 * From https://github.com/coverallsapp/github-action/blob/master/src/lcov-processor.ts
 *
 * Adjusts the base path of all the paths in an LCOV file
 * The paths in the LCOV file will be joined with the provided base path
 * @param lcovFile a string containing an entire LCOV file
 * @param basePath the base path to join with the LCOV file paths
 */
const adjustLcovBasePath = (lcovFile: string, basePath: string) =>
  lcovFile.replace(
    /^SF:(.+)$/gm,
    (_, match) => `SF:${path.join(basePath, match)}`
  );

run();
