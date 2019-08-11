import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';
import {RoomType} from '../types';

export default class LichessApi {
    baseUrl: string;
    token: string;
    headers: { [key: string]: string };

    constructor(token: string) {
        this.token = token;
        this.baseUrl = 'lichess.org';
        this.headers = { 'Authorization': `Bearer ${this.token}` };
    }

    get(path: string): Promise<http.IncomingMessage> {
        return this._sendRequest(path, 'get');
    }

    post(path: string, body?: any): Promise<http.IncomingMessage> {
        return this._sendRequest(path, 'post', body);
    }

    acceptChallenge(challengeId: string) {
        return this.post(`/api/challenge/${challengeId}/accept`);
    }

    declineChallenge(challengeId: string) {
        return this.post(`/api/challenge/${challengeId}/decline`);
    }

    sendMessage(gameId: string, room: RoomType, text: string) {
        return this.post(`/api/bot/game/${gameId}/chat`, {room, text});
    }

    makeMove(gameId: string, move: string) {
        return this.post(`/api/bot/game/${gameId}/move/${move}`);
    }

    abortGame(gameId: string) {
        return this.post(`api/bot/game/${gameId}/abort`);
    }

    resignGame(gameId: string) {
        return this.post(`api/bot/game/${gameId}/resign`);
    }

    createStream<T>(path: string, cb: (event: T) => void) {

    }

    _sendRequest(path: string, method: 'get' | 'post', body?: any): Promise<http.IncomingMessage> {
        return new Promise((resolve, reject) => {
            const request = https.request({
                host: this.baseUrl,
                headers: this.headers,
                path,
                method
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