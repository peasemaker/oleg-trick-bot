import AsyncHttps from './helpers/asyncHttps';

import {
    LichessLobbyEvent,
    LichessGameEvent
} from './types';

const id = 'olegtrick';
const token = '3LBpuFgvWMF74HgB';
let gameId = '';
const asyncHttps = new AsyncHttps(token);

const createStream = async <T>(path: string, cb: (event: T) => void) => {
    const response = await asyncHttps.get(path);

    response.on('data', (data) => {
        const streamData = data.toString('utf8').split('\n');

        for (let i = 0; i < streamData.length; i++) {
            if (!streamData[i]) {
                continue;
            }

            const streamEvent = JSON.parse(streamData[i]);

            cb(streamEvent);
        }
    });
};

const challengeEventListener = (event: LichessLobbyEvent) => {
    if (event.type === 'challenge') {
        console.log('streamEvent', event);
        if (!event.challenge.rated && event.challenge.challenger.id === 'victorinthesky') {
            asyncHttps.post(`/api/challenge/${event.challenge.id}/accept`);
        } else {
            asyncHttps.post(`/api/challenge/${event.challenge.id}/decline`);
        }
    } else {
        console.log('gameStart', event);
        asyncHttps.post(`/api/bot/game/${event.game.id}/chat`, {room: 'player', text: 'Hello! I am Oleg!'});
        createStream<LichessGameEvent>(`/api/bot/game/stream/${event.game.id}`, gameEventListener);
    }
};

const gameEventListener = (event: LichessGameEvent) => {
    if (event.type === 'gameFull') {
        gameId = event.id;
        if (event.white.id === id) {
            console.log('I am white and move!');
            asyncHttps.post(`/api/bot/game/${gameId}/move/e2e4`);
        }
    } else if (event.type === 'gameState'){
        console.log('I am black and move!');
        console.log('gameId', gameId);
        asyncHttps.post(`/api/bot/game/${gameId}/move/e7e5`);
    }
};

createStream<LichessLobbyEvent>('/api/stream/event', challengeEventListener);