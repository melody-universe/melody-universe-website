import { appendFile, readFile } from "fs/promises";
import { join } from "path";
import { env } from "process";
import yamljs from "yamljs";

const rawYaml = (
  await readFile(join(import.meta.dirname, "dom-cloud.yml"))
).toString();

const repoUrl = ["GITHUB_SERVER_URL", "GITHUB_REPOSITORY"]
  .map(getRequiredEnvironmentVariable)
  .join("/");

const yamlWithSource = rawYaml.replace("${{ source }}", repoUrl);

const json = JSON.stringify(yamljs.parse(yamlWithSource));

const outputFile = getRequiredEnvironmentVariable("GITHUB_OUTPUT");

await appendFile(outputFile, `DATA=${json}`);
console.log((await readFile(outputFile)).toString());

function getRequiredEnvironmentVariable(key: string) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
