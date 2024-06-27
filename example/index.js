const {CreateScaffold,$,cd} = require('../dist/cjs/index');


(async () => {
  const opt = {
    gitUser: 'freeliujian' || config.name,
  };

  const BI = new CreateScaffold(opt);
  const meta = await BI.getUserRepoList();
  const metaUrl = meta.map((item) => {
    return item.url
  })
  await BI.getRepoTemplates(metaUrl);
})()