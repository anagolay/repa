import { Command } from 'commander';
import { join } from 'ramda';

import { configFileName, readConfig } from '..';
import { ICommonOptions } from '../bin';

/**
 * Workflow main Command
 *
 * @remarks Usage `anagolay help workflow`
 *
 * @public
 */
export default async function makeCommand(): Promise<Command> {
  const cmd = new Command('export');
  const exportVars = new Command('vars');

  cmd.description('Export command');
  cmd.addCommand(exportVars);

  exportVars.action(main);
  exportVars.option('-c, --config <file>', 'Config path', configFileName);

  return cmd;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
async function main({ config: _configFileName }: ICommonOptions): Promise<void> {
  const { projectName } = await readConfig(_configFileName || configFileName);

  const varsToExport = [`COMPOSE_PROJECT_NAME=${projectName}`];

  console.log(join('\n', varsToExport));
}

// ../repa export vars --config ../repa.yml > .env && source .env && docker-compose up
// ../repa export vars --config ../repa.yml > .env && source .env && echo $COMPOSE_PROJECT_NAME
