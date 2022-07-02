import schedule from 'node-schedule'
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler'

// const rule = new schedule.RecurrenceRule();
// rule.second = new schedule.Range(0, 60);

const cronJob = schedule.scheduleJob('*/1 * * * * *', function () {
  console.log('node-schedule everything!')
})

const scheduler = new ToadScheduler()

const task = new AsyncTask(
  'simple task',
  async () => {
    console.log('toad-scheduler everything!')
  },
  (err: Error) => {
    /* handle error here */
  }
)
const job = new SimpleIntervalJob({ seconds: 1 }, task)

scheduler.addSimpleIntervalJob(job)

// when stopping your app
// scheduler.stop()
