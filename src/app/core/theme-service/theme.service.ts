import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError, SourceType } from '../utils';
import { Image } from '../image-service/image.service';

export interface Theme {
    id: number;
    name: string;
    sourceType: SourceType;
    description?: string;
    sourceInfo?: any;
}

export interface ThemeImage extends Theme {
    images: Partial<Image>[];
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

    public async getTheme(themeId: number): Promise<Theme> {
        const { data, error } = await this.supabaseService.supabase
            .from('theme')
            .select(`
          name,
          id,
          description
        `).eq('id', themeId).single();

        handleError('', error);
        return new Promise((resolve) => {resolve(data as Theme)});                    
    }

    /**
     *  Return theme with associated images that can be displayed
     * Note the use of the inner keyword to force an inner join to return not null
     * from the joined image table
     */
    public async themeImages(): Promise<ThemeImage[]> {
        const { data, error } = await this.supabaseService.supabase
            .from('theme')
            .select(`
          name,
          id,
          description,
          images:image!inner (
            sourceType:source_type,
            source,
            description
          )          
        `);

        try {
            handleError('', error);
            return new Promise((resolve) => {resolve(Object.assign([] as ThemeImage[], data))});                
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