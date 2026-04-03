import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { createJobService } from './job-service.js';
import { processJob } from './processor.js';

const redisOptions = { maxRetriesPerRequest: null };

export function createRedisConnection(redisUrl, RedisClass = IORedis) {
  return new RedisClass(redisUrl, redisOptions);
}

export function createQueueRuntime({ queueName, redisUrl }, dependencies = {}) {
  const {
    RedisClass = IORedis,
    QueueClass = Queue,
    findJob = Job.fromId.bind(Job)
  } = dependencies;
  const connection = createRedisConnection(redisUrl, RedisClass);
  const queue = new QueueClass(queueName, { connection });

  return {
    close: async () => {
      await queue.close();
      await connection.quit();
    },
    jobService: createJobService({
      addJob: (payload, options) => queue.add('job', payload, options),
      loadJob: (id) => findJob(queue, id)
    })
  };
}

export function createWorkerRuntime({ queueName, redisUrl }, dependencies = {}) {
  const {
    RedisClass = IORedis,
    WorkerClass = Worker,
    processor = processJob
  } = dependencies;
  const connection = createRedisConnection(redisUrl, RedisClass);
  const worker = new WorkerClass(
    queueName,
    async (job) => processor(job.data, job.attemptsMade),
    { connection }
  );

  return {
    close: async () => {
      await worker.close();
      await connection.quit();
    },
    worker
  };
}
