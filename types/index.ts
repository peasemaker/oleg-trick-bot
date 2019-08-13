export interface LichessUser {
    id: string;
    name: string;
}

export interface LichessGameVariant {
    key: string;
    name: string;
    short: string;
}

export interface LichessClockTimeControl {
    type: 'clock';
    limit: number;
    increment: number;
    show: string;
}

export interface LichessUnlimitedTimeControl {
    type: 'unlimited';
}

export interface LichessCorrespondenceTimeControl {
    type: 'correspondence';
    daysPerTurn: number;
}

export type LichessTimeControl = LichessClockTimeControl | LichessUnlimitedTimeControl | LichessCorrespondenceTimeControl;

export type LichessColor = 'black' | 'white' | 'random';

export enum LobbyEventType {
    CHALLENGE = 'challenge',
    GAME_START = 'gameStart'
}

export interface LichessChallenge {
    id: string;
    status: string;
    challenger: LichessUser;
    destUser: LichessUser;
    variant: LichessGameVariant;
    rated: boolean;
    speed: string;
    timeControl: LichessTimeControl;
    color: LichessColor;
}

export interface LichessChallengeEvent {
    type: LobbyEventType.CHALLENGE;
    challenge: LichessChallenge;
}

export interface LichessGameStartEvent {
    type: LobbyEventType.GAME_START;
    game: {
        id: string;
    }
}

export type LichessLobbyEvent = LichessChallengeEvent | LichessGameStartEvent;


export enum GameEventType {
    GAME_FULL = 'gameFull',
    GAME_STATE = 'gameState',
    CHAT_LINE = 'chatLine'
}

export interface LichessGameStateEvent {
    type: GameEventType.GAME_STATE;
    moves: string;
    wtime: number;
    btime: number;
    winc: number;
    binc: number;
    wdraw: boolean;
    bdraw: boolean;
}

export interface LichessGameFullEvent {
    type: GameEventType.GAME_FULL;
    id: string;
    variant: LichessGameVariant;
    speed: string;
    rated: boolean;
    createdAt: number;
    white: LichessUser;
    black: LichessUser;
    initialFen: string;
    state: LichessGameStateEvent;
}

export enum RoomType {
    PLAYER = 'player',
    SPECTATOR = 'spectator'
}

export interface LichessChatLineEvent {
    type: GameEventType.CHAT_LINE;
    room: RoomType;
    username: string;
    text: string;
}

export type LichessGameEvent = LichessGameFullEvent | LichessGameStateEvent | LichessChatLineEvent;

export const DEFAULT_POS = 'startpos';