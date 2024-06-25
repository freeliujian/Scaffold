import os from 'node:os';
import { resolve } from 'node:path';
import { existsSync, mkdirpSync, readdirSync, rmdirSync, statSync, unlinkSync, writeFileSync, accessSync, constants, readFileSync } from 'fs-extra';
import chalk from 'chalk';
import { join } from 'path';
import { globSync } from 'glob';
import axios, { AxiosStatic } from 'axios';
import { $, cd } from './until';

interface ICreateScaffoldProps {
  installWay?: 'pnpm' | 'npm' | 'yarn';
  gitUser: string
}

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
    this.user = this.props.gitUser;
    this.createSATemplates();
    this.setGitUser();
    this.axios = axios;
    this.allTheRepoMessage = [];
  }

  setGitUser = async () => {
    try {
      const configFileName = '.config.json';
      const configFileNamePath = resolve(this.SADir(), `./${configFileName}`);
      let configData: any = {};

      try {
        accessSync(configFileNamePath, constants.R_OK | constants.W_OK);
        const existingConfig = readFileSync(configFileNamePath, 'utf-8');
        configData = JSON.parse(existingConfig);
      } catch (err) {
        console.error('No access to config file or it does not exist, creating a new one.');
      }

      configData['gitUser'] = this.user;
      writeFileSync(configFileNamePath, JSON.stringify(configData, null, 2));
      console.log(chalk.green(`Successfully updated ${configFileName} with git user ${this.user}`));
    } catch (err) {
      throw err;
    }
   
  }

  createSATemplates = async () => {
    const SATemplatesDir = resolve(this.SADir(), './.templates');
    this.basicUserPath = SATemplatesDir;
    if (!existsSync(SATemplatesDir)) {
        mkdirpSync(SATemplatesDir);
    }
  }

  removeSATemplates = async (slient: boolean = false) => {
    const { basicUserPath } = this;
    if (existsSync(basicUserPath)) {
      const { stderr, stdout } = await $`rm -rf ${this.basicUserPath}`;
      console.log(stderr, 'stderr');
      console.log(stdout, 'stdout');
      if (!slient) {
        console.log(chalk.green('deleted successful'))
      }
    }
  }

  gitEmail = async (email: string, isGlobal: boolean = true) => {
    try {
      const { stderr } = await $`git config ${isGlobal ? '--global' : ''} user.email "${email}"`;
      console.log(stderr, chalk.gray('successful'));
    } catch (error) {
      console.error('💥Error:', error);
    }
  }

  setGitName = async (name: string, isGlobal: boolean = true) => {
    try {
      const { stderr } =  await $`git config ${(isGlobal) && '--global'} user.name "${name}"`;
      console.log(stderr, chalk.gray('successful'));
    } catch (error) {
      console.error('💥Error:', error);
    }
  }

  gitCloneTemplates = async (repoUrl: string,  targetDir?: string) => {
    const { basicUserPath } = this;
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
      .filter(item => {
        const regex = /-sa$/;
        return regex.test(item.name);
      })
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

  SADir = () => {
    const userRootDir = os.homedir();
    return resolve(userRootDir, '.sa')
  };

}


export default CreateScaffold;
