import os from 'node:os';
import { resolve } from 'node:path';
import { existsSync, mkdirpSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'fs-extra';
import { chdir } from 'process';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { join } from 'path';
import { globSync } from 'glob';
import axios, { AxiosStatic } from 'axios';

interface ICreateScaffoldProps {
  installWay?: 'pnpm' | 'npm' | 'yarn';
  gitUser: string
}

type ExecResult = {
  stdout: string;
  stderr: string;
};

type TemplateStringArray = TemplateStringsArray;


function noop() {
  return true;
}

class CreateScaffold {
  props: ICreateScaffoldProps;
  basicUserPath: string;
  cliPath: string;
  axios: AxiosStatic;
  allTheRepoMessage: any[];
  user: string;

  constructor(props: ICreateScaffoldProps) {
    this.props = props;
    this.basicUserPath = '';
    this.cliPath = resolve(__dirname, './');
    this.createSATemplates();
    this.axios = axios;
    this.allTheRepoMessage = [];
    this.user = this.props.gitUser;
  }

  cd = (dir: string) => {
    chdir(dir);
  }

  createSATemplates = async () => {
    const userRootDir = os.homedir();
    const SADir = resolve(userRootDir, '.sa/.templates');
    this.basicUserPath = SADir;
    if (!existsSync(SADir)) {
        mkdirpSync(SADir);
    }
  }

  removeSATemplates = async (slient: boolean = false) => {
    const { $, basicUserPath } = this;
    if (existsSync(basicUserPath)) {
      const { stderr, stdout } = await $`rm -rf ${this.basicUserPath}`;
      console.log(stderr, 'stderr');
      console.log(stdout, 'stdout');
      if (!slient) {
        console.log(chalk.green('deleted successful'))
      }
    }
  }

  $ = async (pieces: TemplateStringArray, ...args: any[]): Promise<ExecResult> => {
    const command = pieces.reduce((acc, piece, i) => acc + piece + (args[i] || ''), '');

    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data;
      });

      child.stderr.on('data', (data) => {
        stderr += data;
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`💥 Command failed with exit code ${code}. Stderr: ${stderr}`));
        }
      });
    });
  }

  gitEmail = async (email: string, isGlobal: boolean = true) => {
    const { $ } = this;
    try {
      const { stderr } = await $`git config ${isGlobal ? '--global' : ''} user.email "${email}"`;
      console.log(stderr, chalk.gray('successful'));
    } catch (error) {
      console.error('💥Error:', error);
    }
  }

  setGitName = async (name: string, isGlobal: boolean = true) => {
    const { $ } = this;
    try {
      const { stderr } =  await $`git config ${(isGlobal) && '--global'} user.name "${name}"`;
      console.log(stderr, chalk.gray('successful'));
    } catch (error) {
      console.error('💥Error:', error);
    }
  }

  gitCloneTemplates = async (repoUrl: string,  targetDir?: string) => {
    const { $, cd, basicUserPath } = this;
    const targetDirPath = targetDir || basicUserPath;
    try {
      cd(basicUserPath);
      await $`git clone ${repoUrl}`;
      console.log(chalk.green(`🚀 Successfully cloned ${repoUrl} into ${targetDirPath}`));
      // const templatesIndex = readdirSync(targetDirPath);
  
      // console.log(index);
      // const gitDir = join(templatesIndex[index], '.git');
    
      // console.log(gitDir, index);
      // const files = globSync("**/*", { cwd: gitDir, dot: true, absolute: true });
      // for (const file of files.reverse()) {
      //   const stat = statSync(file);
      //   if (stat.isDirectory()) {
      //     rmdirSync(file);
      //   } else {
      //     unlinkSync(file);
      //   }
      // }
      // rmdirSync(gitDir);

      // console.log(chalk.green(`Successfully removed .git directory from ${targetDirPath}`));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  getRepoTemplates = async (url: string | string[] = '') => {
    const { gitCloneTemplates } = this;
    const repoUrl = url;
    if (typeof repoUrl === 'string') {
      gitCloneTemplates(repoUrl);
    } else {
      try {
        const clonePromises = repoUrl.map((item) => gitCloneTemplates(item));
        await Promise.all(clonePromises);
        await this.rmGitFolders();
      } catch (err) {
        throw new Error('💥Invalid input. URLs should be an array.');
      }
    }
  };

  rmGitFolders = async () => {
    const { basicUserPath } = this;
    const templatesIndex = readdirSync(basicUserPath);
    for (const index in templatesIndex) {
      const templateDir = join(basicUserPath, templatesIndex[index]);
      const gitDir = join(templateDir, '.git');

      if (existsSync(gitDir)) {
        const files = globSync("**/*", { cwd: gitDir, dot: true, absolute: true });
        
        for (const file of files.reverse()) {
          const stat = statSync(file);
          if (stat.isDirectory()) {
            rmdirSync(file);
          } else {
            unlinkSync(file);
          }
        }
        rmdirSync(gitDir);
        
        console.log(chalk.green(`🔥Successfully removed .git directory from ${templateDir}`));
      }
    }
  };

  rmDirRecursiveSync = (dir: string) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        this.rmDirRecursiveSync(fullPath);
      } else {
        unlinkSync(fullPath);
      }
    }
    // 删除空目录
    rmdirSync(dir);
  }

  install = async () => {
    const { $ } = this;
    try {
      $`pnpm --version`.then(res => {
        console.log(res);
        console.log(`version: ${chalk.green(res.stdout)}`);
      });
      $`pnpm install`.then(res => {
        console.log(chalk.green(res.stdout));
      });
    } catch (err) {
      console.error('💥Error during pnpm install:', err);
    }
  }

  updateRepo = async () => {
    console.log(this.cliPath);
  }

  getUserRepoList = async (filter:((item:any) => boolean) = noop): Promise<any> => {
    this.allTheRepoMessage = (await this.axios.get(`https://api.github.com/users/${this.user}/repos`)).data;
    const meta = this.allTheRepoMessage
      .filter(item => !item.fork)
      .filter(filter) 
      .map(item => {
      return {
        name: item.name,
        desc: item.description,
        url: item.clone_url,
      }
    })
    return meta;
  }
}


export default CreateScaffold;
