import { default as CreateScaffold } from "./scaffold";
import {
  $,
  cd,
  getSADir,
  setGitUser,
  createSATemplates,
  removeSATemplates,
  gitEmail,
  setGitName,
  gitCloneTemplates,
  getRepoTemplates,
  rmGitFolders,
  rmDirRecursiveSync,
  install,
  updateRepo,
  getUserRepoList,
} from "./scaffold/utils";
import {
  DEFAULT_NAME,
  DEFAULT_END_NAME,
  RAGEX_END_REPO,
  RAGEX_END_FILE,
} from "./scaffold/constants";

exports.CreateScaffold = CreateScaffold;
exports.$ = $;
exports.cd = cd;
exports.getSADir = getSADir;
exports.setGitUser = setGitUser;
exports.createSATemplates = createSATemplates;
exports.removeSATemplates = removeSATemplates;
exports.gitEmail = gitEmail;
exports.setGitName = setGitName;
exports.gitCloneTemplates = gitCloneTemplates;
exports.getRepoTemplates = getRepoTemplates;
exports.rmGitFolders = rmGitFolders;
exports.rmDirRecursiveSync = rmDirRecursiveSync;
exports.install = install;
exports.updateRepo = updateRepo;
exports.getUserRepoList = getUserRepoList;
exports.constants = {
  DEFAULT_NAME,
  DEFAULT_END_NAME,
  RAGEX_END_REPO,
  RAGEX_END_FILE,
};

export default {
  CreateScaffold,
  $,
  cd,
  getSADir,
  setGitUser,
  createSATemplates,
  removeSATemplates,
  gitEmail,
  setGitName,
  gitCloneTemplates,
  getRepoTemplates,
  rmGitFolders,
  rmDirRecursiveSync,
  install,
  updateRepo,
  getUserRepoList,
  constants: {
    DEFAULT_NAME,
    DEFAULT_END_NAME,
    RAGEX_END_REPO,
    RAGEX_END_FILE,
  },
};
