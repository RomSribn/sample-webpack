import { Command } from 'commander';
import packageJson from '../../package.json';
import { saveToken, getToken, clearAll } from '../lib/token';
import { getPersonalAccessTokenFromWebsocket } from '../lib/login';

const program = new Command();

program
  .name(`${packageJson.name} (shorthand 'ze')`)
  .version(packageJson.version)
  .helpOption('-h, --help', 'Display help for command');
// .showHelpAfterError(true);

program
  .command('login')
  .description('Login to Zephyr Cloud')
  .action(async () => {
    if (await getToken()) {
      console.log('You are already logged in');
      return;
    }
    const token = await getPersonalAccessTokenFromWebsocket();
    await saveToken(token);
    console.log('You are logged in');
  });

program
  .command('logout')
  .description('Logout from Zephyr Cloud')
  .action(async () => {
    await clearAll();
    console.log('You are logged out');
  });

// program
//   .command('build')
//   .description('Build your project locally using Zephyr Cloud credentials')
//   .action(async () => {
//     console.log('build', getToken());
//   });

// program
//   .command('deploy')
//   .description('Build and push the snapshots to Zephyr Cloud')
//   .action(async () => {
//     console.log('deploy', getToken());
//   });

program.parse(process.argv);
