import chalk from 'chalk';
import CreateScaffold from '../scaffold';
import { $ } from 'zx';

interface Iopt {
  install: 'pnpm' | 'npm' | 'yarn';
}

class BaseInstall extends CreateScaffold {
  opt: Iopt;

  constructor(props: any) {
    const sProps = {};
    super(sProps);
    this.opt = props;
  }

  install = async () => {
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
};
const BI = new BaseInstall(opt);

(async () => {
  BI.install();
})()

// export default BaseInstall;