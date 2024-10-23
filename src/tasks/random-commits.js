const BaseTask = require('./base');
const logger = require('../utils/logger');
const path = require('path');
const simpleGit = require('simple-git');

class RandomCommits extends BaseTask {
  constructor(config) {
    super(config);
    this.probabilityMap = {
      0: 3,   // 3% chance of 0 commits
      1: 56,  // 56% chance of 1 commit
      2: 20,  // 20% chance of 2 commits
      3: 15,  // 15% chance of 3 commits
      4: 4,   // 4% chance of 4 commits
      5: 2    // 2% chance of 5 commits
    };
    this.repoPath = path.join(process.cwd(), 'data', 'git-repo');
    this.git = simpleGit(this.repoPath);
  }

  getCommitCount() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [commits, probability] of Object.entries(this.probabilityMap)) {
      cumulative += probability;
      if (rand <= cumulative) {
        return parseInt(commits);
      }
    }
    
    return 1; // Default fallback
  }

  async ensureRepoExists() {
    try {
      await this.git.checkIsRepo();
    } catch {
      logger.info('Initializing new git repository...');
      await this.git.init();
      await this.git.addConfig('user.name', process.env.GIT_USERNAME || 'Automation Bot');
      await this.git.addConfig('user.email', process.env.GIT_EMAIL || 'bot@example.com');
    }
  }

  async makeCommit(count) {
    const timestamp = new Date().toISOString();
    const filePath = path.join(this.repoPath, 'changes.txt');
    const change = `Change ${count} at ${timestamp}\n`;
    
    await fs.promises.appendFile(filePath, change);
    await this.git.add(filePath);
    await this.git.commit(`RandomCommits: Change ${count} [${timestamp}]`);
  }

  async run() {
    const commitCount = this.getCommitCount();
    logger.info(`RandomCommits task will make ${commitCount} commits`);

    if (commitCount === 0) {
      logger.info('No commits scheduled for this run');
      return null;
    }

    try {
      await this.ensureRepoExists();

      const results = [];
      for (let i = 0; i < commitCount; i++) {
        await this.makeCommit(i + 1);
        results.push(`Commit ${i + 1} completed`);
      }

      return {
        commitCount,
        results,
        timestamp: new Date().toISOString(),
        repoPath: this.repoPath
      };
    } catch (error) {
      logger.error(`Error in RandomCommits task: ${error.message}`);
      throw error;
    }
  }

  validateConfig() {
    super.validateConfig();
    // Add any additional validation specific to RandomCommits task
  }
}

module.exports = RandomCommits;