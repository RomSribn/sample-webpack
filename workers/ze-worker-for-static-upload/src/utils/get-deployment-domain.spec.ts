import { getZeApp } from './get-ze-app-from-uri';

const actual_expected_list = [
	// remove support for root render, add a special app to render list of apps
	['http://list.edge.lan:8787/', 'edge.lan'],
	['http://valorkin-zephyr-mono-sample-webpack-application.edge.lan:8787/', 'edge.lan'],
	['http://valorkin-zephyr-mono-sample-webpack-application_valorkin_1411.edge.lan:8787/', 'edge.lan'],
	['https://valorkin-zephyr-mono-sample-webpack-application.cf.valorkin.dev/', 'cf.valorkin.dev'],
	['https://valorkin-zephyr-mono-sample-webpack-application.cf.valorkin.dev/asda/asd.js', 'cf.valorkin.dev'],
	['https://valorkin-zephyr-mono-sample-webpack-application.ran.dom.dev/asda/asd.js', 'ran.dom.dev'],
];

describe('get app domain name', () => {
	actual_expected_list.forEach((line) => {
		it(`should return the ${line[1]} for a ${line[0]}`, async () => {
			const input = line[0];
			const expectedOutput = line[1];

			const { domain } = getZeApp(new URL(input));

			expect(domain).toEqual(expectedOutput);
		});
	});
});
