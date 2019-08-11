import {LichessGameEvent, LichessLobbyEvent, RoomType} from './types';
import LichessApi from './helpers/lichessApi';

const id = 'olegtrick';
let gameId = '';
const token = '3LBpuFgvWMF74HgB';

export default class LichessBot {
    api: LichessApi;
    
    constructor() {
        this.api = new LichessApi(token);
    }

    start() {
        this.api.streamLobby((event) => this.challengeEventListener(event));
    }
    
    challengeEventListener(event: LichessLobbyEvent) {
        if (event.type === 'challenge') {
            console.log('streamEvent', event);
            if (!event.challenge.rated && event.challenge.challenger.id === 'victorinthesky') {
                this.api.acceptChallenge(event.challenge.id);
            } else {
                this.api.declineChallenge(event.challenge.id);
            }
        } else {
            console.log('gameStart', event);
            this.api.sendMessage(event.game.id, RoomType.PLAYER, 'Hello! I am Oleg!');
            this.api.streamGame(event.game.id, (event) => this.gameEventListener(event));
        }
    }

    gameEventListener(event: LichessGameEvent) {
        if (event.type === 'gameFull') {
            gameId = event.id;
            if (event.white.id === id) {
                this.api.makeMove(gameId, 'e2e4');
            }
        } else if (event.type === 'gameState'){
            this.api.makeMove(gameId, 'e7e5');
        }
    };
}