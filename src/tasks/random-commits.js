const BaseTask = require('./base');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

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
    this.dummyFilePath = path.join(process.cwd(), 'data', 'dummy_file.txt');
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

  async run() {
    const commitCount = this.getCommitCount();
    logger.info(`RandomCommits task will make ${commitCount} commits`);

    if (commitCount === 0) {
      logger.info('No commits scheduled for this run');
      return null;
    }

    try {
      // Ensure the data directory exists
      await fs.mkdir(path.dirname(this.dummyFilePath), { recursive: true });

      // Make changes to the file
      const timestamp = new Date().toISOString();
      const change = `Change for commit ${commitCount} at ${timestamp}\n`;
      await fs.appendFile(this.dummyFilePath, change);

      const commitMessage = `RandomCommits: Commit ${commitCount}`;
      logger.info(`Made changes for ${commitMessage}`);

      return {
        commitCount,
        commitMessage,
        timestamp,
        filePath: this.dummyFilePath
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