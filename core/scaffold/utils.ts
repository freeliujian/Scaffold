import { chdir } from "process";
import { spawn } from "child_process";
import os from "node:os";
import { resolve } from "node:path";
import {
  existsSync,
  mkdirpSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
  accessSync,
  constants,
  readFileSync,
} from "fs-extra";
import chalk from "chalk";
import { join } from "path";
import { globSync } from "glob";
import axios from "axios";
import { CACHE_CONFIG_NAME, CACHE_TEMPLATE_NAME, DEFAULT_END_NAME, RAGEX_END_REPO } from "./constants";

// 获取用户的.sad目录路径
export const getSADir = (): string => {
  const userRootDir = os.homedir();
  return resolve(userRootDir, `${DEFAULT_END_NAME}`);
};

// 设置Git用户
export const setGitUser = async (user: string): Promise<void> => {
  try {
    const configFileNamePath = resolve(getSADir(), `./${CACHE_CONFIG_NAME}`);
    let configData: any = {};

    try {
      accessSync(configFileNamePath, constants.R_OK | constants.W_OK);
      const existingConfig = readFileSync(configFileNamePath, "utf-8");
      configData = JSON.parse(existingConfig);
    } catch (err) {
      console.error(
        "No access to config file or it does not exist, creating a new one."
      );
    }

    configData["gitUser"] = user;
    writeFileSync(configFileNamePath, JSON.stringify(configData, null, 2));
    console.log(
      chalk.green(
        `Successfully updated ${CACHE_CONFIG_NAME} with git user ${user}`
      )
    );
  } catch (err) {
    throw err;
  }
};

// 创建SA模板目录
export const createSATemplates = async (): Promise<string> => {
  const SATemplatesDir = resolve(getSADir(), `./${CACHE_TEMPLATE_NAME}`);
  if (!existsSync(SATemplatesDir)) {
    mkdirpSync(SATemplatesDir);
  }
  return SATemplatesDir;
};

// 删除SA模板目录
export const removeSATemplates = async (
  basicUserPath: string,
  silent: boolean = false
): Promise<void> => {
  if (existsSync(basicUserPath)) {
    const { stderr, stdout } = await $`rm -rf ${basicUserPath}`;
    console.log(stderr, "stderr");
    console.log(stdout, "stdout");
    if (!silent) {
      console.log(chalk.green("deleted successful"));
    }
  }
};

// 设置Git邮箱
export const gitEmail = async (
  email: string,
  isGlobal: boolean = true
): Promise<void> => {
  try {
    const { stderr } = await $`git config ${
      isGlobal ? "--global" : ""
    } user.email "${email}"`;
    console.log(stderr, chalk.gray("successful"));
  } catch (error) {
    console.error("💥Error:", error);
  }
};

// 设置Git用户名
export const setGitName = async (
  name: string,
  isGlobal: boolean = true
): Promise<void> => {
  try {
    const { stderr } = await $`git config ${
      isGlobal ? "--global" : ""
    } user.name "${name}"`;
    console.log(stderr, chalk.gray("successful"));
  } catch (error) {
    console.error("💥Error:", error);
  }
};

// 克隆Git仓库模板
export const gitCloneTemplates = async (
  repoUrl: string,
  basicUserPath: string,
  targetDir?: string
): Promise<void> => {
  const targetDirPath = targetDir || basicUserPath;
  try {
    cd(basicUserPath);
    await $`git clone ${repoUrl}`;
    console.log(
      chalk.green(`🚀 Successfully cloned ${repoUrl} into ${targetDirPath}`)
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

// 获取并克隆多个Git仓库模板
export const getRepoTemplates = async (
  url: string | string[],
  basicUserPath: string
): Promise<void> => {
  if (typeof url === "string") {
    await gitCloneTemplates(url, basicUserPath);
  } else {
    try {
      const clonePromises = url.map((item) =>
        gitCloneTemplates(item, basicUserPath)
      );
      await Promise.all(clonePromises);
      await rmGitFolders(basicUserPath);
    } catch (err) {
      throw new Error("💥Invalid input. URLs should be an array.");
    }
  }
};

// 删除克隆模板中的.git目录
export const rmGitFolders = async (basicUserPath: string): Promise<void> => {
  const templatesIndex = readdirSync(basicUserPath);
  for (const index in templatesIndex) {
    const templateDir = join(basicUserPath, templatesIndex[index]);
    const gitDir = join(templateDir, ".git");

    if (existsSync(gitDir)) {
      const files = globSync("**/*", {
        cwd: gitDir,
        dot: true,
        absolute: true,
      });

      for (const file of files.reverse()) {
        const stat = statSync(file);
        if (stat.isDirectory()) {
          rmdirSync(file);
        } else {
          unlinkSync(file);
        }
      }
      rmdirSync(gitDir);

      console.log(
        chalk.green(`🔥Successfully removed .git directory from ${templateDir}`)
      );
    }
  }
};

// 递归删除目录及其内容
export const rmDirRecursiveSync = (dir: string): void => {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      rmDirRecursiveSync(fullPath);
    } else {
      unlinkSync(fullPath);
    }
  }
  rmdirSync(dir);
};

// 安装依赖包
export const install = async (): Promise<void> => {
  try {
    $`pnpm --version`.then((res) => {
      console.log(res);
      console.log(`version: ${chalk.green(res.stdout)}`);
    });
    $`pnpm install`.then((res) => {
      console.log(chalk.green(res.stdout));
    });
  } catch (err) {
    console.error("💥Error during pnpm install:", err);
  }
};

// 更新仓库
export const updateRepo = async (cliPath: string): Promise<void> => {
  console.log(cliPath);
};

// 获取Git用户的仓库列表
export const getUserRepoList = async (
  user: string,
  filter: (item: any) => boolean = () => true
): Promise<any[]> => {
  const allTheRepoMessage = (
    await axios.get(`https://api.github.com/users/${user}/repos`)
  ).data;
  const meta = allTheRepoMessage
    .filter((item: any) => !item.fork)
    .filter((item: any) => {
      return RAGEX_END_REPO.test(item.name);
    })
    .filter(filter)
    .map((item: any) => {
      return {
        name: item.name,
        desc: item.description,
        url: item.clone_url,
      };
    });
  return meta;
};

export const cd = (dir: string) => {
  chdir(dir);
};

type ExecResult = {
  stdout: string;
  stderr: string;
};

type TemplateStringArray = TemplateStringsArray;

export const $ = async (
  pieces: TemplateStringArray,
  ...args: any[]
): Promise<ExecResult> => {
  const command = pieces.reduce(
    (acc, piece, i) => acc + piece + (args[i] || ""),
    ""
  );

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      stderr += data;
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `💥 Command failed with exit code ${code}. Stderr: ${stderr}`
          )
        );
      }
    });
  });
};
