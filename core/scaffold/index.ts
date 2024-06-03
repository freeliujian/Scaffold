
import zx, { $ } from 'zx';
import HbsBaseGenerator from 'base-handlebars-generator';
import chalk from 'chalk';

const { BaseGenerator } = HbsBaseGenerator;


interface ICreateScaffoldProps {
  beforeStart?: any;
}

class CreateScaffold {
  BaseGenerator: any;
  props: ICreateScaffoldProps;
  zx: typeof zx;

  constructor(props: ICreateScaffoldProps) {
    this.props = props;
    this.BaseGenerator = BaseGenerator;
    this.zx = zx;
  }

  beforeStart = () => {
    const { beforeStart } = this.props;
    (beforeStart) && beforeStart();
  };

  init = () => {
  };

   zxSpawnSync = async (commandString: string) => {
    return await $`${commandString}`;
  };

  gitEmail = async (email: string, isGlobal: boolean = true) => {
    const commandString = `git config ${(isGlobal) && '--global'} user.email "${email}"`;
    return this.setGitConfig(commandString);
  };

  gitName = async (name: string, isGlobal: boolean = true) => {
    const commandString = `git config ${(isGlobal) && '--global'} user.name "${name}"`;
    return await $`${commandString}`;
  };

  private setGitConfig = async (commandString: string) => {
    const useZx = () => {
      return this.zxSpawnSync(`${commandString}`);
    };

    useZx().then((res) => {
      console.log(chalk.green(`设置成功 \n ${res}`));
    }).catch(err => {
      console.log(chalk.red(`设置失败:\n${err}`));
    });
  };
}

export default CreateScaffold;

