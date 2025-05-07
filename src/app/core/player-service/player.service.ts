import { Injectable } from '@angular/core';


export const ANONYMOUS_PLAYER = {
    id: 1,
    name: 'Anonymous'
};      

export interface Player {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class PlayerService {

    constructor() {}

    addPlayer(playerName: string): void {
        // TODO
    }

    getPlayer(): Player {
        // TODO
        return ANONYMOUS_PLAYER;
    }
}