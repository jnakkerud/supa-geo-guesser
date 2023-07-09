import { Injectable } from '@angular/core';

export interface TotalResult {
    id?: number;
    themeId: number;
    score: number;
}

let nextId = 0;
const results = new Map<number, TotalResult>();

@Injectable({providedIn: 'root'})
export class ResultsService {

    public save(result: TotalResult): Promise<TotalResult> {

        // Clone
        const newResult = Object.assign({}, result);
        newResult.id = nextId++;

        results.set(newResult.id, newResult);

        return new Promise((resolve) => resolve(newResult));        
    }

    public get(id: number): Promise<TotalResult> {
        const result = results.get(id);
        if (result) {
            return new Promise((resolve) => resolve(result));
        }
        return new Promise((reject) => reject({score:0, themeId:0}));
    }
    
}