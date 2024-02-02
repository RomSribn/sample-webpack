'use strict';


exports.handler = async (event) => {
  const html = `<h1> fckn aws lambda</h1>`
   const response = {
            status: '200',
            headers: addSecurityHeaders({
                'cache-control': [{ value: `max-age=100` }],
                'content-type': [{ value: 'text/html;charset=UTF-8' }]
            }),
            body: html
   }
    return response;
}

function addSecurityHeaders(headers) {
    headers['strict-transport-security'] = [{ value: 'max-age=31536000; includeSubDomains' }];
    headers['content-security-policy'] = [{ value: "default-src 'self'" }];
    headers['x-xss-protection'] = [{ value: '1; mode=block' }];
    headers['x-content-type-options'] = [{ value: 'nosniff' }];
    headers['x-frame-options'] = [{ value: 'DENY' }];
    return headers;
}