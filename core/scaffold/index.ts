import zx, { usePowerShell, useBash, fs, path } from 'zx';
import HbsBaseGenerator from 'base-handlebars-generator';
import os from 'node:os';

const { BaseGenerator, Generator } = HbsBaseGenerator;


interface ICreateScaffoldProps {
  beforeStart?: any;
}

class CreateScaffold {
  BaseGenerator: any;
  props: ICreateScaffoldProps;
  zx: typeof zx;
  Generator: any;

  constructor(props: ICreateScaffoldProps) {
    this.props = props;
    this.BaseGenerator = BaseGenerator;
    this.Generator = Generator;
    this.zx = zx;
    this.init();
  }

  beforeStart = () => {
    const { beforeStart } = this.props;
    (beforeStart) && beforeStart();
  };

  private init = () => {
    const os_env = os.type();
    const rage = /Windows_NT/;
    if (rage.test(os_env)) {
      usePowerShell();
    } else {
      useBash();
    }
  };

  checkCurrentVersion = async () => {
    const { version } = await fs.readJson('./package.json');
    console.log(version)
  };

  getVersion = async () => {
    try {
      const baseDir = path.resolve(__dirname, './package.json');
      const { version } = await fs.readJson(baseDir);
      console.log(version);

    } catch (error) {
      console.log(`err: ${error}`);
    }
  };
}

const opt = {};
const BI = new CreateScaffold(opt);

(async () => {
  BI.getVersion();
})()

export default CreateScaffold;

