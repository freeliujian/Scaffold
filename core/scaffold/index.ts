import {
  setGitUser,
  createSATemplates,
  removeSATemplates,
  gitEmail,
  setGitName,
  gitCloneTemplates,
  getRepoTemplates,
  rmGitFolders,
  rmDirRecursiveSync,
  install,
  updateRepo,
  getUserRepoList,
} from "./utils";
import { resolve } from "node:path";
import axios, { AxiosStatic } from "axios";

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
    this.basicUserPath = "";
    this.cliPath = resolve(__dirname, "./");
    this.user = this.props.gitUser;
    this.axios = axios;
    this.allTheRepoMessage = [];
  }

  async init() {
    this.basicUserPath = await createSATemplates();
    await setGitUser(this.user);
  }

  async removeSATemplates(silent: boolean = false) {
    await removeSATemplates(this.basicUserPath, silent);
  }

  async gitEmail(email: string, isGlobal: boolean = true) {
    await gitEmail(email, isGlobal);
  }

  async setGitName(name: string, isGlobal: boolean = true) {
    await setGitName(name, isGlobal);
  }

  async gitCloneTemplates(repoUrl: string, targetDir?: string) {
    await gitCloneTemplates(repoUrl, this.basicUserPath, targetDir);
  }

  async getRepoTemplates(url: string | string[]) {
    await getRepoTemplates(url, this.basicUserPath);
  }

  async rmGitFolders() {
    await rmGitFolders(this.basicUserPath);
  }

  rmDirRecursiveSync(dir: string) {
    rmDirRecursiveSync(dir);
  }

  async install() {
    await install();
  }

  async updateRepo() {
    await updateRepo(this.cliPath);
  }

  async getUserRepoList(filter: (item: any) => boolean = noop): Promise<any[]> {
    return await getUserRepoList(this.user, filter);
  }
}

export default CreateScaffold;
