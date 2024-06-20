const CreateScaffold = require('../dist/cjs/scaffold').default;

const opt = {
  url: '',
};
const BI = new CreateScaffold(opt);

(async () => {
  const url = ['git@github.com:freeliujian/vue-template.git', 'https://github.com/freeliujian/react-template.git'];
  BI.getRepoTemplates(url);
})()