import { Env } from '../index';
import { TagsHeader } from './post-upload-tags';

export async function getListOfApps(request: Request, env: Env) {
	const url = new URL(request.url);
	const port = url.port;
	const cursor = url.searchParams.get('cursor');

	const kvList = await getKVList(env, cursor);

	// Generate HTML string with KV pairs
	const html = generateHTML(kvList, {
		url: request.url,
		port,
		hostname: url.hostname,
		cursor: kvList?.list_complete ? '' : kvList?.cursor,
	});

	// Return HTML response
	return new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
}

function generateHTML(kvList: any, options: any) {
	// Start of your HTML
	let html = `<html><head><title>Ze Application List</title></head><body><ul>`;

	// List each KV pair
	kvList?.keys?.forEach((kv: any) => {
		html += `<li><a href="//${kv.name}.${options.hostname}:${options.port}">${kv.name}</></li>`;
	});

	// Close list
	html += `</ul>`;

	// Add Previous/Next buttons with appropriate links to handle your pagination.
	// You'll need to implement getNextPageUrl() and getPrevPageUrl() to determine these URLs.
	html += `
    <div>
      <button onclick="location.href='${getPrevPageUrl(options)}'">Previous</button>
      <button onclick="location.href='${getNextPageUrl(options)}'">Next</button>
    </div>
  `;

	// Close your HTML
	html += `</body></html>`;

	return html;
}

async function getKVList(env: Env, cursor: string | null) {
	return await env.ze_tags.list<TagsHeader>({ limit: 10, cursor });
}

function getNextPageUrl(options: any) {
	return `${options.url}?cursor=${options.cursor}`;
}

function getPrevPageUrl(options: any) {
	return `${options.url}`;
}
