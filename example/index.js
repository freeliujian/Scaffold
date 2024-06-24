const CreateScaffold = require('../dist/cjs/scaffold').default;

const opt = {
  gitUser: 'freeliujian',
  installWay: 'pnpm'
};
const BI = new CreateScaffold(opt);

(async () => {
  const meta = await BI.getUserRepoList();
  console.log(meta) 
})()