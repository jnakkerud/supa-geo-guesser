import { Injectable } from '@angular/core';
import { Theme } from '../theme-service/theme.service';
import { SourceType } from '../utils';
import { SupabaseService } from '../supabase-service/supabase.service';
import { ScoreCard } from '../score-service/score.service';
import { Player } from '../player-service/player.service';

export interface PlayerScore {
    id: number;
    theme: Theme;
    score: number;
    player: Player;
    gameSummary: ScoreCard[];
}

const EMPTY_THEME: Theme = {
    id: 0,
    name: 'Empty Theme',
    sourceType: SourceType.FLICKR
}

const scoreColumns = `
id,
score,
gameSummary:game_summary,
theme:theme (
    id,
    name,
    sourceType:source_type
),
player:player (
    id,
    name,
    canScore:can_score
)
`;

export class LocalScoreStoreService {
    nextId = 0;
    results = new Map<number, PlayerScore>();

    public save(result: Partial<PlayerScore>): Promise<PlayerScore> {
        // Clone
        const newResult = Object.assign({}, result) as PlayerScore;
        newResult.id = this.nextId++;

        this.results.set(newResult.id, newResult);

        return new Promise((resolve) => resolve(newResult));        
    }

    public get(id: number): PlayerScore | undefined {
        return this.results.get(id);
    }
}

@Injectable({providedIn: 'root'})
export class ScoreStoreService {

    localStore = new LocalScoreStoreService();

    constructor(private supabaseService: SupabaseService) {}

    public save(playerScore: Partial<PlayerScore>, persistStore: boolean): Promise<PlayerScore> {
        if (persistStore) {
            // save to the db
            return this.insert(playerScore);
        }
        return this.localStore.save(playerScore);        
    }

    public get(id: number): Promise<PlayerScore> {
        let result = this.localStore.get(id);
        if (!result) {
            return this.getById(id);
        }
        return new Promise((resolve) => resolve(result));
    }
    
    // Get a result by id
    public async getById(id: number): Promise<PlayerScore> {
        const { data, error } = await this.supabaseService.supabase
            .from('score')
            .select(scoreColumns)
            .eq('id', id)
            .single();
        if (error) {
            throw error;
        }

        // Map the result to PlayerScore
        let result: PlayerScore = Object.assign({} as PlayerScore, data);
        result.gameSummary = result.gameSummary.map((s: ScoreCard) => {
            const scoreCard = new ScoreCard(s.image);
            scoreCard.scores = s.scores;
            scoreCard.imageAddress = s.imageAddress;
            return scoreCard
        });
      
        return new Promise((resolve) => resolve(result)); 
    }

    // Get Results filtered by the theme id
    // TODO map results to TotalResult
    public async getByThemeId(themeId: number): Promise<PlayerScore[]> {
        const { data, error } = await this.supabaseService.supabase
            .from('score')
            .select(`*`)
            .eq('theme_id', themeId);
        if (error) {
            throw error;
        }
        return new Promise((resolve) => resolve(data as PlayerScore[]));
    }

    // insert a new score into the database
    private async insert(playerScore: Partial<PlayerScore>): Promise<PlayerScore> { 
        const { data, error } = await this.supabaseService.supabase
            .from('score')
            .insert([{
                score: playerScore.score,
                theme_id: playerScore.theme?.id,
                player_id: playerScore.player?.id,
                game_summary: playerScore.gameSummary,
                game_type: playerScore.theme?.sourceType === SourceType.FLICKR_GROUP ? 'timed' : 'standard'
            }])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return new Promise((resolve) => resolve(data as PlayerScore));
    }

}