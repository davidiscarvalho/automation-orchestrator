const BaseTask = require('./base');
const logger = require('../utils/logger');

class ExampleTask extends BaseTask {
  constructor(config) {
    super(config);
    this.taskConfig = config.config || {};
  }

  async run() {
    logger.info(`Running example task with config: ${JSON.stringify(this.taskConfig)}`);
    
    // Example task implementation
    const result = {
      timestamp: new Date().toISOString(),
      message: 'Example task executed successfully'
    };

    return result;
  }
}

module.exports = ExampleTask;