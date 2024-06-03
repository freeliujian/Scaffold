import CreateScaffold from '../scaffold';
import { $ } from 'zx';

class BaseInstall extends CreateScaffold {

  constructor(props: any) {
    super(props);
  }

  install = async () => {
    try {
      await this.zxSpawnSync('git --version');
      // await this.zxSpawnSync('pnpm install');
      await $`pnpm --version`
    } catch (err) {
      console.error('Error during pnpm install:', err);
    }
  };
}

const opt = {};
const BI = new BaseInstall(opt);

BI.install();

export default BaseInstall;