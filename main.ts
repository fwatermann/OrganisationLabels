import dotenv from "dotenv";
import GitHub from "./GitHub";

//Load Environment Variables from ".env" file
dotenv.config();

const github : GitHub = new GitHub(process.env.GITHUB_TOKEN as string);

const ciLabels : {name: string, color: string, description:string}[] = [
    {name: "major", color: "B60205", description: "Increment the major version when merged"},
    {name: "minor", color: "ff9900", description: "Increment the minor version when merged"},
    {name: "patch", color: "006B75", description: "Increment the patch version when merged"},
    {name: "skip-release", color: "BFDADC", description: "Does not increment version when merged"},
]

github.getOrg("SmartCity-2022").then(async (org) => {
    if(org == null) return;
    let repos = await github.getOrgRepositories(org.login);
    for(let i = 0; i < repos.length; i ++) {
        for(let j = 0; j < ciLabels.length; j ++) {
            let result = await github.createLabel(repos[i], ciLabels[j].name, ciLabels[j].color, ciLabels[j].description);
            if(result == null) {
                console.error("Failed to create label " + ciLabels[j].name + " for repository " + repos[i].full_name);
            }
        }
    }
});
