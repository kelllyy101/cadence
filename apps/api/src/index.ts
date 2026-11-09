import type { Clock } from '@cadence/domain';
import { systemClock } from '@cadence/domain';

export const clock: Clock = systemClock;
