import { Injectable } from '@angular/core';
import { TotalScore } from '../score-service/score.service';
import { TapObserver } from 'rxjs';

export interface TotalResult extends TotalScore {
    id?: number;
}

let nextId = 0;
const results = new Map<number, TotalResult>();

@Injectable({providedIn: 'root'})
export class ResultsService {

    public save(result: TotalScore): Promise<TotalResult> {

        // Clone
        const newResult = Object.assign({}, result) as TotalResult;
        newResult.id = nextId++;

        results.set(newResult.id, newResult);

        return new Promise((resolve) => resolve(newResult));        
    }

    public get(id: number): Promise<TotalResult> {
        const result = results.get(id);
        if (result) {
            return new Promise((resolve) => resolve(result));
        }
        return new Promise((reject) => reject({total:0,themeId:0}));
    }
    
}