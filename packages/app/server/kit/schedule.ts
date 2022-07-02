import { TTask } from '../../types/shim'
import nodeSchedule from 'node-schedule'
import toadSchedule from 'toad-scheduler'

export async function schedule(
  id: string,
  type: TTask['scheduleType'],
  value: TTask['scheduleValue']
) {}

export async function cancelSchedule(id: string) {}
