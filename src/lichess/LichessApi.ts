import * as oboe from 'oboe';
import * as https from 'https';
import * as querystring from 'querystring';
import {LichessGameEvent, LichessLobbyEvent, RoomType} from './types';

export default class LichessApi {
  baseUrl: string;
  token: string;
  headers: { [key: string]: string };

  constructor(token: string) {
    this.token = token;
    this.baseUrl = 'lichess.org';
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  get(path: string) {
    return this._sendRequest(path, 'get');
  }

  post(path: string, body?: any) {
    return this._sendRequest(path, 'post', body);
  }

  getAccountInfo() {
    return this.get('/api/account');
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
    return this.post(`/api/bot/game/${gameId}/abort`);
  }

  resignGame(gameId: string) {
    return this.post(`/api/bot/game/${gameId}/resign`);
  }

  streamLobby(cb: (event: LichessLobbyEvent) => void) {
    return this.createStream<LichessLobbyEvent>('/api/stream/event', cb);
  }

  streamGame(gameId: string, cb: (event: LichessGameEvent) => void) {
    return this.createStream<LichessGameEvent>(`/api/bot/game/stream/${gameId}`, cb);
  }

  createStream<T>(path: string, cb: (event: T) => void) {
    oboe({
      method: 'GET',
      url: 'https://' + this.baseUrl + path,
      headers: this.headers
    }).node('!', (event) => {
      cb(event);
    }).fail((error) => console.error(`STREAM ERROR: ${JSON.stringify(error)}`));
  }

  _sendRequest(path: string, method: 'get' | 'post', body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = https.request({
        protocol: 'https:',
        host: this.baseUrl,
        headers: this.headers,
        path,
        method
      }, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk.toString();
        });

        res.on('end', () => {
          try {
            const parsedBody = JSON.parse(body || '');
            resolve(parsedBody);
          } catch(error) {
            console.error('Parse error', body);
            reject(body);
          }
        });
      });

      request.write(querystring.stringify(body || {}));
      request.on('error', reject);
      request.end();
    })
  }
}