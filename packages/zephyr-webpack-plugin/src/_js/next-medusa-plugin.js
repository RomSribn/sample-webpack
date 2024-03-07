import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';
import * as fs from 'fs';
import { mergeGraphs } from '../federation-dashboard-legacy/utils/merge-graphs/merge-graphs';

const PLUGIN_NAME = 'next-medusa-plugin';

class NextMedusaPlugin {
  constructor(options) {
    this._options = options;
  }

  apply(compiler) {
    const sidecarData = this._options.filename.includes('sidecar')
      ? join(compiler.options.output.path, this._options.filename)
      : join(compiler.options.output.path, `sidecar-${this._options.filename}`);
    const hostData = join(
      compiler.options.output.path,
      this._options.filename.replace('sidecar-', ''),
    );

    const MedusaPlugin = new FederationDashboardPlugin({
      ...this._options,
      nextjs: true,
    });
    MedusaPlugin.apply(compiler);

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, () => {
      const sidecarData = join(
        compiler.options.output.path,
        `sidecar-${this._options.filename}`,
      );
      const hostData = join(
        compiler.options.output.path,
        this._options.filename.replace('sidecar-', ''),
      );
      if (existsSync(sidecarData) && existsSync(hostData)) {
        fs.writeFileSync(
          hostData,
          JSON.stringify(mergeGraphs(require(sidecarData), require(hostData))),
        );
      }
    });

    compiler.hooks.done.tapAsync('NextMedusaPlugin', (stats, done) => {
      if (existsSync(sidecarData) && existsSync(hostData)) {
        const dashboardData = readFileSync(hostData, 'utf8');
        MedusaPlugin.postDashboardData(dashboardData).then(done).catch(done);
      } else {
        done();
      }
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withMedusa =
  ({ name, ...medusaConfig }) =>
  (nextConfig = {}) =>
    Object.assign({}, nextConfig, {
      webpack(config, options) {
        if (
          options.nextRuntime !== 'edge' &&
          !options.isServer &&
          process.env.NODE_ENV === 'production'
        ) {
          if (!name) {
            throw new Error(
              'Medusa needs a name for the app, please ensure plugin options has {name: <appname>}',
            );
          }
          config.plugins.push(
            new NextMedusaPlugin({
              standalone: { name },
              ...medusaConfig,
            }),
          );
        }

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    });
