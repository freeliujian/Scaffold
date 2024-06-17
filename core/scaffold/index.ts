import { usePowerShell, useBash, $ } from 'zx';
import os from 'node:os';
import chalk from 'chalk';

interface ICreateScaffoldProps {
  url: string;
  installWay?: 'pnpm' | 'npm' | 'yarn';

}
class CreateScaffold {
  props: ICreateScaffoldProps;

  constructor(props: ICreateScaffoldProps) {
    this.props = props;
    this.init();
  }

  private init = () => {
    const os_env = os.type();
    const rage = /Windows_NT/;
    if (rage.test(os_env)) {
      usePowerShell();
    } else {
      useBash();
    }
  };

  async gitInit() {
    try {
      $`git -v`.then(res => {
        console.log(chalk.green(res.stdout));
      })
      $`git init`.then(res => {
        console.log(chalk.green(res.stdout));
      });
    } catch (err) {
      console.log(err);
    }
  }
  
  async gitEmail(email: string, isGlobal: boolean = true) {
    const commandString = await $`git config ${(isGlobal) && '--global'} user.email "${email}"`;
    console.log(commandString.stdout, chalk.gray('设置成功'));
  };

  async setGitName (name: string, isGlobal: boolean = true): Promise<any>  {
    const commandString = await $`git config ${(isGlobal) && '--global'} user.name "${name}"`;
    console.log(commandString.stdout, chalk.gray('设置成功'));
  };

  async gitClone() {
    const commandString = await $`git clone ${this.props.url}`;
    console.log(commandString.stdout)
  };  

  async install () {
    try {
      $`pnpm --version`.then(res => {
        console.log(`version: ${chalk.green(res)}`);
      });
      $`pnpm install`.then(res => {
        console.log(chalk.green(res.stdout));
      });
    } catch (err) {
      console.error('Error during pnpm install:', err);
    }
  };

}

const opt = {
  url: '',
};
const BI = new CreateScaffold(opt);

(async () => {
  // BI.gitInit()
  BI.setGitName('liujian');
})()

export default CreateScaffold;

