import { fork } from 'node:child_process';
import { join, sep, relative } from 'node:path';
import { Compiler } from 'webpack';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';
import { zephyr_agent, ZephyrAgentProps } from './ze-agent';
import * as process from 'node:process';
import { onDeploymentDone } from './ze-agent/lifecycle-events';

export function setupZeDeploy(
  pluginOptions: ZeWebpackPluginOptions,
  compiler: Compiler
): void {
  const { pluginName, zeConfig } = pluginOptions;
  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
      },
      async (assets) => {
        if (!zeConfig.buildId) {
          // no id - no cloud builds ;)
          return;
        }

        // get converted graph here and send it to the agent

        const stats = compilation.getStats();
        const stats_json = compilation.getStats().toJson();

        process.nextTick((props: ZephyrAgentProps) => zephyr_agent(props), {
          stats,
          stats_json,
          assets,
          pluginOptions,
        });
        if (!pluginOptions.wait_for_index_html) {
          await onDeploymentDone();
        }
      }
    );
  });
}
