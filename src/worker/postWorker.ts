import { Worker } from "bullmq";
import { redisOptions } from "../utils/redis";

const postWorker = new Worker('postQueue', async (job) => {
    console.log(`Proccesing job ${job.id} with ${job.data}`)
}, { connection: redisOptions })

postWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
  
  postWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });