import schedule from 'node-schedule'
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler'

// const rule = new schedule.RecurrenceRule();
// rule.second = new schedule.Range(0, 60);

// const job = schedule.scheduleJob('*/61 * * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

const scheduler = new ToadScheduler()

const task = new AsyncTask(
  'simple task',
  async () => {
    console.log('The answer to life, the universe, and everything!')
  },
  (err: Error) => {
    /* handle error here */
  }
)
const job = new SimpleIntervalJob({ seconds: 1 }, task)

scheduler.addSimpleIntervalJob(job)

// when stopping your app
// scheduler.stop()
