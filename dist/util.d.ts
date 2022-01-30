import * as github from '@actions/github';
export declare function note(octokit: ReturnType<typeof github.getOctokit>, owner: string, name: string, tagName: string): Promise<string>;
export declare function labels(octokit: ReturnType<typeof github.getOctokit>, owner: string, repo: string, pr: number): Promise<string[]>;
