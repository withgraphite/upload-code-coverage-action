"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
                file = fs_1.default.readFileSync(pathToLcov, 'utf8');
            }
            catch (err) {
                throw new Error("Lcov file not found.");
            }
            const adjustedFile = basePath ? adjustLcovBasePath(file, basePath) : file;
            yield (0, node_fetch_1.default)("https://api.graphite.dev/external/v1/graphite/code-coverage/upload", {
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
            });
        }
        catch (error) {
            core.setFailed(error.message);
        }
        return 0;
    });
}
/**
 * From https://github.com/coverallsapp/github-action/blob/master/src/lcov-processor.ts
 *
 * Adjusts the base path of all the paths in an LCOV file
 * The paths in the LCOV file will be joined with the provided base path
 * @param lcovFile a string containing an entire LCOV file
 * @param basePath the base path to join with the LCOV file paths
 */
const adjustLcovBasePath = (lcovFile, basePath) => lcovFile.replace(/^SF:(.+)$/gm, (_, match) => `SF:${path_1.default.join(basePath, match)}`);
run();
//# sourceMappingURL=index.js.map