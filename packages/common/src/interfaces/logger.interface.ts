import { LeveledLogMethod, Logger as Winston } from 'winston'

import { logLevels } from '@lib/extend/logger.constants'

export type ILogger = Winston & Record<keyof typeof logLevels, LeveledLogMethod>