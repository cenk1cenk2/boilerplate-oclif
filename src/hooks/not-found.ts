import { Hook } from '@oclif/config'
import Help from '@oclif/plugin-help'

import { Logger } from '@src/lib/extend/logger'

const hook: Hook<'command_not_found'> = async (opts) => {
  const logger = new Logger(opts.config.name).log
  logger.critical('Command not found. Take a look at help. You can also use -[h]elp flag for subcommands.', { custom: opts.config.name })

  const help = new Help(opts.config)
  help.showHelp([ '--all' ])

  process.exit(120)
}

export default hook
