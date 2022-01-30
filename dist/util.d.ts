import * as github from '@actions/github';
export declare function note(octokit: ReturnType<typeof github.getOctokit>, owner: string, name: string, tagName: string): Promise<string>;
export declare function pulls(html: string, owner: string, name: string): number[];
export declare function labels(octokit: ReturnType<typeof github.getOctokit>, owner: string, repo: string, prs: number[]): Promise<string[]>;
