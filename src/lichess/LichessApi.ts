import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';
import {
  LichessGameEvent,
  LichessLobbyEvent,
  RoomType
} from '../types';

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
    return this.sendRequest(path, 'get');
  }

  post(path: string, body?: any) {
    return this.sendRequest(path, 'post', body);
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

  async createStream<T>(path: string, cb: (event: T) => void) {
    const response = await this.simpleRequest(path, 'get');
    let prevData = '';

    response.on('data', (data) => {
      const streamData = data.split('\n');

      for (let i = 0; i < streamData.length; i++) {
        if (!streamData[i]) {
          continue;
        }
        let streamEvent: T;

        try {
          streamEvent = JSON.parse(prevData + streamData[i]);
        } catch (error) {
          console.error('stream parse error', error);
          prevData += streamData[i];
          continue;
        }

        prevData = '';
        cb(streamEvent);
      }
    });

    response.on('end', () => {
      console.log('stream is ended!');
    });
  }

  private async simpleRequest(path: string, method: 'get' | 'post', body?: any): Promise<http.IncomingMessage> {
    return new Promise((resolve, reject) => {
      const request = https.request({
        protocol: 'https:',
        host: this.baseUrl,
        headers: this.headers,
        path,
        method
      }, (res) => {
        res.setEncoding('utf8');
        resolve(res);
      });

      request.write(querystring.stringify(body || {}));
      request.on('error', reject);
      request.end();
    });
  }

  private async sendRequest(path: string, method: 'get' | 'post', body?: any): Promise<any> {
    const response = await this.simpleRequest(path, method, body);

    return new Promise((resolve, reject) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        try {
          const parsedBody = JSON.parse(body || '');
          resolve(parsedBody);
        } catch(error) {
          console.error('Parse error', body);
          reject(body);
        }
      });
    });
  }
}

// createStream<T>(url: string): AsyncIterable<T> {
//   const results: IteratorResult<T>[] = [];
// let result = '';
// let flush: ((data: IteratorResult<T>) => void) | null = null;
//
// return {
//   [Symbol.asyncIterator]: () => {
//     this.sendRequest(url, 'get', null, async (res) => {
//       for await (const data of res) {
//         if (data instanceof Buffer) {
//           const lines = data.toString('utf8').split('\n');
//
//           lines.forEach((data, ix) => {
//             if (data) {
//               data = ix === 0
//                 ? result + data
//                 : data;
//
//               try {
//                 results.push({
//                   done: false,
//                   value: JSON.parse(data)
//                 });
//
//                 result = '';
//               } catch (err) {
//                 result = data;
//               }
//             }
//           });
//
//           if (flush) {
//             const result = results.shift();
//
//             if (result) {
//               flush(result);
//             }
//           }
//         }
//       }
//
//       const end = { done: true } as IteratorResult<T>;
//
//       if (flush) {
//         flush(end);
//       } else {
//         results.push(end);
//       }
//     });
//
//     return {
//       next() {
//         return new Promise<IteratorResult<T>>((resolve) => {
//           const result = results.shift();
//
//           if (result) {
//             resolve(result);
//           } else {
//             flush = (data) => {
//               resolve(data);
//
//               flush = null;
//             };
//           }
//         });
//       }
//     };
//   }
// };
// }