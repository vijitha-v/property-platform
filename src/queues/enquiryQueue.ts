import { Queue, Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASS,
};

export const enquiryQueue = new Queue('enquiries', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export const deadLetterQueue = new Queue('enquiries-failed', { connection });

export const enquiryWorker = new Worker('enquiries', async (job) => {
  if (job.name === 'crm-sync') {
    console.log(`Processing CRM sync for enquiry: ${job.data.enquiryId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`CRM sync completed for enquiry: ${job.data.enquiryId}`);
  }
}, { connection });

enquiryWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

enquiryWorker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
  await deadLetterQueue.add('failed-job', {
    job: job?.data,
    error: err.message,
    failedAt: new Date()
  });
});
