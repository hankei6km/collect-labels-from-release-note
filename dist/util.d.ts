import * as github from '@actions/github';
declare type NoteInRes = {
    repository: {
        release: {
            descriptionHTML: string;
        };
    };
};
export declare function noteInRes(res: unknown): res is NoteInRes;
export declare function note(octokit: ReturnType<typeof github.getOctokit>, owner: string, name: string, tagName: string): Promise<string>;
export declare function labels(octokit: ReturnType<typeof github.getOctokit>, owner: string, repo: string, pr: number): Promise<string[]>;
export {};
