import Conf from 'conf';
import packageJson from '../../package.json';

export const conf = new Conf({
  projectName: packageJson.name,
  projectVersion: packageJson.version,
  // this is not intended for security purposes
  // https://github.com/sindresorhus/conf/tree/main#encryptionkey
  encryptionKey: 'zephyr-cli',
  clearInvalidConfig: true,
  schema: {
    token: {
      type: 'string',
      default: '',
    },
  },
});

export default conf;
