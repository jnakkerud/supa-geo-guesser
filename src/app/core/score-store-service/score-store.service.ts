import { Injectable } from '@angular/core';
import { TotalScore } from '../score-service/score.service';
import { Theme } from '../theme-service/theme.service';
import { SourceType } from '../utils';

export interface TotalResult extends TotalScore {
    id?: number;
}

const EMPTY_THEME: Theme = {
    id: 0,
    name: 'Empty Theme',
    sourceType: SourceType.FLICKR
}

export class LocalScoreStoreService {
    nextId = 0;
    results = new Map<number, TotalResult>();

    public save(result: TotalScore): Promise<TotalResult> {
        // Clone
        const newResult = Object.assign({}, result) as TotalResult;
        newResult.id = this.nextId++;

        this.results.set(newResult.id, newResult);

        return new Promise((resolve) => resolve(newResult));        
    }

    public get(id: number): Promise<TotalResult> {
        const result = this.results.get(id);
        if (result) {
            return new Promise((resolve) => resolve(result));
        }
        return new Promise((reject) => reject({total:0,theme:EMPTY_THEME}));
    }
}

@Injectable({providedIn: 'root'})
export class ScoreStoreService {

    localStore = new LocalScoreStoreService();

    public save(result: TotalScore): Promise<TotalResult> {
        return this.localStore.save(result);
    }

    public get(id: number): Promise<TotalResult> {
        return this.localStore.get(id);
    }
    
}