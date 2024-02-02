// clean all entries in KV in cloudflare

require('dotenv').config();
const nfetch = import('node-fetch');

const namespaces = [
  '474ef5c725f74362be5ed84accc82b89',
  '962f0549087e457bb32e9675bf65aa37',
  'bfbebd5c4d724a6aa80510b9e43c61b1',
];
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

const apiToken = process.env.CLOUDFLARE_API_TOKEN;

async function cleanNamespace(namespaceId) {
  const fetch = (await nfetch).default;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys`;
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
    e,
  };

  // Get all keys
  const response = await fetch(url, { headers });
  const data = await response.json();

  // Delete each key
  for (const item of data.result) {
    console.log(`Deleting ${item.name}`);
    const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${item.name}`;
    await fetch(deleteUrl, { method: 'DELETE', headers });
  }
}

async function cleanKV() {
  for (const namespaceId of namespaces) {
    await cleanNamespace(namespaceId);
  }
}

cleanKV().catch(console.error);
