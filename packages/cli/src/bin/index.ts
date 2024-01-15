import { Command } from 'commander';
import packageJson from '../../package.json';
import { saveToken, getToken } from '../lib/token';
import { getPersonalAccessTokenFromWebsocket } from '../lib/login';

const program = new Command();

program
  .name(packageJson.name)
  .version(packageJson.version)
  .helpOption('-h, --help', 'Display help for command')
  .showHelpAfterError(false);

program
  .command('login')
  .description('Login to Zephyr Cloud')
  .action(async () => {
    const token = await getPersonalAccessTokenFromWebsocket();
    saveToken(token);
  });

program
  .command('build')
  .description('Build your project locally using Zephyr Cloud credentials')
  .action(async () => {
    console.log('build', getToken());
  });

program
  .command('deploy')
  .description('Build and push the snapshots to Zephyr Cloud')
  .action(async () => {
    console.log('deploy', getToken());
  });

program.parse(process.argv);
