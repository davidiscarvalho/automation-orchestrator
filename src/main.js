require('dotenv').config();
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const Orchestrator = require('./orchestrator');
const logger = require('./utils/logger');

async function loadConfig() {
  const configPath = path.join(__dirname, '../config/config.yaml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  return YAML.parse(configFile);
}

async function main() {
  try {
    const config = await loadConfig();
    const orchestrator = new Orchestrator(config);
    await orchestrator.run();
  } catch (error) {
    logger.error(`Failed to start orchestrator: ${error.message}`);
    process.exit(1);
  }
}

main();