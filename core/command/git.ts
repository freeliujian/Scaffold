import zx, { $} from 'zx';
import CreateScaffold from '../scaffold';


interface IGitCommandProps {
}

class GitCommand extends CreateScaffold{
  props: IGitCommandProps;
  zx: typeof zx;

  constructor(props: IGitCommandProps) {
    super(props);
    this.props = props;
    this.zx = zx;
  }

  zxSpawnSync = async (commandString: string) => {
    return await $`${commandString}`;
  };

  gitEmail = async (email: string, isGlobal: boolean = true) => {
    const commandString = `git config ${(isGlobal) && '--global'} user.email "${email}"`;
    return await $`${commandString}`;
  };

  gitName = async (name: string, isGlobal: boolean = true) => {
    const commandString = `git config ${(isGlobal) && '--global'} user.name "${name}"`;
    return await $`${commandString}`;
  };
}

export default GitCommand;

