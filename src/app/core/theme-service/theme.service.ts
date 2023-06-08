import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError } from '../utils';

export interface Theme {
    id: number;
    name: string;
    description?: string;
}

@Injectable({providedIn: 'root'})
export class ThemeService {
    constructor(private supabaseService: SupabaseService) { }
    
    public async themes(): Promise<Theme[]> {
        const { data, error } = await this.supabaseService.supabase
            .from('theme')
            .select(`
          name,
          id,
          description
        `);

        try {
            handleError('', error);
            return new Promise((resolve) => {resolve(Object.assign([] as Theme[], data))});                
        } catch (error) {
            return new Promise((resolve) => {resolve([])});                
        }
    }

    public async insert(theme:  Partial<Theme>): Promise<Theme[] |  Error> {
        console.log('Inserting theme', theme);
        const { data, error } = await this.supabaseService.supabase
        .from('theme')
        .insert([
          { name: theme.name, updated_at: new Date(), description: theme.description }
        ]).select();

        handleError('Insert Theme Error', error);
        let result: Theme[] = Object.assign([] as Theme[], data);
        return new Promise((resolve) => {resolve(result)});
    }

}