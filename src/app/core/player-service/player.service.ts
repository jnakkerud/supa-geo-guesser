import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError } from '../utils';

const LOCAL_PLAYER_ID = 'supa-geo-player';

export const ANONYMOUS_PLAYER_ID = '1';
export interface Player {
    id: number;
    name: string;
    canScore: boolean;
}

@Injectable({providedIn: 'root',})
export class PlayerService {

    constructor(private supabaseService: SupabaseService) {}

    async addPlayer(playerName: string): Promise<Player> {
        try{
            const result = await this.insert(playerName);
            const player = result[0]
            localStorage.setItem(LOCAL_PLAYER_ID, player.id.toString());
            return new Promise((resolve) => { resolve(player) });
        }
        catch(error){
            if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '23505') {
                throw new Error('Player name already exists');
            }
            throw error;
        }        
    }

    async getPlayer(): Promise<Player> {
        // TODO handle bad id number, rare
        const playerId = localStorage.getItem(LOCAL_PLAYER_ID) ?? ANONYMOUS_PLAYER_ID;
        const { data, error } = await this.supabaseService.supabase
            .from('player')
            .select(`
          name,
          id,
          canScore:can_score
        `).eq('id', +playerId).single();

        handleError('', error);
        return new Promise((resolve) => {resolve(data as Player)});    
    }

    private async insert(playerName: string): Promise<Player[]> {
        const { data, error } = await this.supabaseService.supabase
            .from('player')
            .insert([
                { name: playerName}
            ]).select();

        handleError('Insert Player Error', error);
        let result: Player[] = Object.assign([] as Player[], data);
        return new Promise((resolve) => { resolve(result) });
    }
}