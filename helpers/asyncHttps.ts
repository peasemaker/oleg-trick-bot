import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';

export default class AsyncHttps {
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    get(path: string): Promise<http.IncomingMessage> {
        return this._sendRequest(path, 'get');
    }

    post(path: string, body?: any): Promise<http.IncomingMessage> {
        return this._sendRequest(path, 'post', body);
    }

    _sendRequest(path: string, method: 'get' | 'post', body?: any): Promise<http.IncomingMessage> {
        return new Promise((resolve, reject) => {
            const request = https.request({
                protocol: 'https:',
                host: 'lichess.org',
                path,
                method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${this.token}`
                }
            }, (res) => resolve(res));

            if (body) {
                console.log(body);
                request.write(querystring.stringify(body));
            }
            request.on('error', reject);
            request.end();
        })
    }
}