const CreateScaffold = require('../dist/cjs/scaffold').default;

const opt = {
  url: '',
};
const BI = new CreateScaffold(opt);

(async () => {
  const url = ['git@github.com:freeliujian/vue-template.git', 'https://github.com/freeliujian/react-template.git'];
  const filter = (item) => {
    return item.name.startsWith('application') || item.name.endsWith('template')
  }
  const meta = await BI.getUserRepoList(filter);
  console.log(meta) 
})()