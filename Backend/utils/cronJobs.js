import { CronJob } from "cron";


const job = new CronJob("* */30 * * * *", async () => {
  try {
    console.log("Cron running");
    //task
    console.log("Cron finished");
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

job.start();
console.log("Cron active:", job.running);
