// local, dev, prod
export const api_env = process.env['ZE_DEV'] ?? 'prod';

interface EdgeEndpoint {
  port: number;
  hostname: string;
}

const local_edge_endpoint: EdgeEndpoint = {
  port: 8787,
  hostname: 'edge.lan'
};

const dev_edge_endpoint: EdgeEndpoint = {
  port: 443,
  hostname: 'cf.valorkin.dev'
};

const prod_edge_endpoint: EdgeEndpoint = {
  port: 443,
  hostname: 'cf.valorkin.dev'
};

export const edge_endpoint: EdgeEndpoint = ((env: string) => {
  switch (env) {
    case 'local': return local_edge_endpoint;
    case 'dev': return dev_edge_endpoint;
    default: return prod_edge_endpoint;
  }
})(api_env)

export const buildid_endpoint: EdgeEndpoint = {
  port: 443,
  hostname: 'ze-build-id.valorkin.dev'
};

const local_telemetry_endpoint = 'http://localhost:3333/v2/builder-packages-api/upload-from-dashboard-plugin';
const dev_telemetry_endpoint = 'https://api-dev.zephyr-cloud.io/v2/builder-packages-api/upload-from-dashboard-plugin';

const telemetry_endpoint = 'https://api.zephyr-cloud.io/v2/builder-packages-api/upload-from-dashboard-plugin';

export const telemetry_api_endpoint: string = ((env: string) => {
  switch (env) {
    case 'local': return local_telemetry_endpoint;
    case 'dev': return dev_telemetry_endpoint;
    default: return telemetry_endpoint;
  }
})(api_env)
