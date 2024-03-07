import { Env } from '../env';
import { get_app_list } from '../zephyr-api/get-app-list';

/** this is only for demo purposes */
export async function getUiListOfApps(request: Request, env: Env) {
	const url = new URL(request.url);
	const port = url.port;

	const kvList = await get_app_list(env);

	// Generate HTML string with KV pairs
	const html = generateHTML(kvList, {
		url: request.url,
		port,
		hostname: url.hostname,
	});

	// Return HTML response
	return new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
}

function generateHTML(kvList: any, options: any) {
	// Start of your HTML
	let html = `<html><head><title>Ze Application List</title></head><body><p>App list</p><ul>`;

	// List each KV pair
	kvList?.keys?.forEach((kv: any) => {
		html += `<li><a href="//${kv.name}.${options.hostname}:${options.port}">${kv.name}</></li>`;
	});

	// Close list
	html += `</ul>`;

	// Close your HTML
	html += `</body></html>`;

	return html;
}
