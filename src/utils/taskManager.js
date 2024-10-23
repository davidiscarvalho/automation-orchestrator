const knex = require('knex');
const { CronJob } = require('cron');
const logger = require('./logger');
const BaseTask = require('../tasks/base');

class TaskManager {
  constructor(dbUrl) {
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: dbUrl
      },
      useNullAsDefault: true
    });
    this.tasks = new Map();
    this.initialize();
  }

  async initialize() {
    await this.createTables();
    await this.loadTasks();
  }

  async createTables() {
    const hasTaskTable = await this.db.schema.hasTable('tasks');
    if (!hasTaskTable) {
      await this.db.schema.createTable('tasks', table => {
        table.increments('id');
        table.string('name').unique();
        table.string('module');
        table.string('class');
        table.string('schedule');
        table.boolean('enabled').defaultTo(true);
        table.json('config');
        table.timestamp('created_at').defaultTo(this.db.fn.now());
      });
    }

    const hasExecutionsTable = await this.db.schema.hasTable('task_executions');
    if (!hasExecutionsTable) {
      await this.db.schema.createTable('task_executions', table => {
        table.increments('id');
        table.string('task_name');
        table.timestamp('start_time');
        table.timestamp('end_time');
        table.string('status');
        table.text('error_message');
        table.json('result');
      });
    }
  }

  async loadTasks() {
    const taskConfigs = await this.db('tasks').where('enabled', true);
    
    for (const config of taskConfigs) {
      try {
        const TaskClass = require(`../tasks/${config.module}`);
        const task = new TaskClass(config);
        
        if (!(task instanceof BaseTask)) {
          throw new Error(`Task ${config.name} must inherit from BaseTask`);
        }
        
        this.tasks.set(config.name, {
          instance: task,
          job: new CronJob(config.schedule, () => this.executeTask(task))
        });
        
        logger.info(`Loaded task: ${config.name}`);
      } catch (error) {
        logger.error(`Error loading task ${config.name}: ${error.message}`);
      }
    }
  }

  async getTasksToRun() {
    return Array.from(this.tasks.values()).map(t => t.instance);
  }

  async executeTask(task) {
    const startTime = new Date();
    let status = 'success';
    let errorMessage = null;
    let result = null;

    try {
      result = await task.run();
    } catch (error) {
      status = 'failure';
      errorMessage = error.message;
      logger.error(`Task ${task.name} failed: ${error.message}`);
    }

    await this.recordExecution(task.name, startTime, new Date(), status, errorMessage, result);
  }

  async recordExecution(taskName, startTime, endTime, status, errorMessage, result) {
    await this.db('task_executions').insert({
      task_name: taskName,
      start_time: startTime,
      end_time: endTime,
      status,
      error_message: errorMessage,
      result: JSON.stringify(result)
    });
  }
}

module.exports = TaskManager;