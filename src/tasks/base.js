class BaseTask {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.validateConfig();
  }

  validateConfig() {
    const requiredFields = ['name', 'schedule'];
    for (const field of requiredFields) {
      if (!(field in this.config)) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }
  }

  async run() {
    throw new Error('run() method must be implemented by task subclass');
  }

  async cleanup() {
    // Optional cleanup method to be implemented by subclasses
  }
}

module.exports = BaseTask;