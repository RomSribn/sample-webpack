export const isDev = process.env['ZE_DEV'] ?? false;

interface EdgeEndpoint {
  port: number;
  hostname: string;
}

const dev_edge_endpoint: EdgeEndpoint = {
  port: 8787,
  hostname: '127.0.0.1',
};

const prod_edge_endpoint: EdgeEndpoint = {
  port: 443,
  hostname: 'cf.valorkin.dev',
};

export const edge_endpoint: EdgeEndpoint = isDev
  ? dev_edge_endpoint
  : prod_edge_endpoint;

export const buildid_endpoint: EdgeEndpoint = {
  port: 443,
  hostname: 'ze-build-id.valorkin.dev',
};
