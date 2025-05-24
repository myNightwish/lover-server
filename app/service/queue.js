const amqp = require('amqplib');
const AppError = require('../utils/errors.js').AppError;

class QueueService {
  constructor(ctx) {
    this.ctx = ctx;
    this.config = ctx.app.config.rabbitmq;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await amqp.connect(this.config.url);
    }
    return this.connection;
  }

  async getChannel() {
    const conn = await this.getConnection();
    const channel = await conn.createChannel();
    await channel.assertQueue(this.config.queues.chatGPT, {
      durable: true,
    });
    return channel;
  }

  async publishMessage(data) {
    try {
      const channel = await this.getChannel();
      return channel.sendToQueue(
        this.config.queues.chatGPT,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
      );
    } catch (error) {
      throw new AppError(`Queue publish error: ${error.message}`);
    }
  }

  async startConsumer(callback) {
    console.log('enter---startConsumer', callback);
    try {
      const channel = await this.getChannel();
      await channel.prefetch(this.ctx.app.config.openai.maxConcurrentRequests);

      channel.consume(this.config.queues.chatGPT, async msg => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
          } catch (error) {
            this.ctx.logger.error('Consumer error:', error);
            channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      throw new AppError(`Queue consumer error: ${error.message}`);
    }
  }
}

module.exports = QueueService;
