import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError, SourceType } from '../utils';
import { Image } from '../image-service/image.service';

export interface Theme {
    id: number;
    name: string;
    sourceType: SourceType;
    storeScore: boolean;
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
          sourceType:source_type,
          storeScore:store_score,
          description,
          sourceInfo:source_info
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
          sourceType:source_type,
          storeScore:store_score,
          description,
          sourceInfo:source_info
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
          sourceType:source_type,
          storeScore:store_score,
          description,
          sourceInfo:source_info,
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
          { name: theme.name, updated_at: new Date(), description: theme.description, source_type: theme.sourceType, store_score: theme.storeScore }
        ]).select();

        handleError('Insert Theme Error', error);
        let result: Theme[] = Object.assign([] as Theme[], data);
        return new Promise((resolve) => {resolve(result)});
    }

}