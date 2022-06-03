import { Octokit } from "octokit";
import { components } from "@octokit/openapi-types";

export type RepositorySortCriteria = "created" | "updated" | "pushed" | "full_name";
export type RepositorySortOrder = "asc" | "desc";

export default class GitHub {

    private octokit : Octokit;

    constructor(authToken : string) {
        this.octokit = new Octokit({
            auth: authToken
        });
    }

    public async getOrg(name: string) : Promise<components["schemas"]["organization-full"]|null> {
       let result = await this.octokit.request("GET /orgs/{org}", {
           org: name
       });
       return result.data;
    }

    public async getOrgRepositories(org: string, max: number = 30, page: number = 1, sort: RepositorySortCriteria = "created", sortDir: RepositorySortOrder = (sort == "full_name"?"asc":"desc")) : Promise<components["schemas"]["minimal-repository"][]> {
        if(max > 100 || max < 1) {
            throw new Error("getOrgRepositories: max must be between 1 and 100");
        }
        if(page < 1) {
            throw new Error("getOrgRepositories: page must be greater than 0");
        }

        let result = await this.octokit.request("GET /orgs/{org}/repos", {
            org: org,
            page: page,
            per_page: max,
            sort: sort
        });
        if(result.status == 200) {
            return result.data;
        } else {
            console.warn("GetOrgRepositories unexpected status code: " + result.status);
        }
        return [];
    }

    public async getRepository(owner: string, repo: string) : Promise<components["schemas"]["full-repository"]|null> {
        let result = await this.octokit.request("GET /repos/{owner}/{repo}", {
            owner: owner,
            repo: repo
        });
        if(result.status == 200) {
            return result.data;
        } else {
            console.error("GetRepository status code: " + result.status);
            return null;
        }
    }

    public async createLabel(repository : components["schemas"]["minimal-repository"]|components["schemas"]["full-repository"], name: string, color: string, description: string) : Promise<components["schemas"]["label"]|null> {
        return new Promise((resolve, reject) => {

            this.octokit.request("POST /repos/{owner}/{repo}/labels", {
                owner: repository.owner.login,
                repo: repository.name,
                name: name,
                color: color,
                description: description
            }).then((result) => {
                if(result.status == 201) {
                    resolve(result.data);
                } else {
                    console.error("CreateLabel status code: " + result.status);
                    resolve(null);
                }
            }).catch((err) => {
                console.error("CreateLabel error: " + err);
                resolve(null);
            });

        });
    }

}
