import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError, SourceType } from '../utils';
import { LatLon } from '../lat-lon';

export interface Image {
    id: number;
    themeId: number;
    sourceType: SourceType;
    source: any;
    location: LatLon;
    description?: string;
}

export enum ImageSize {
    SMALL,
    MEDIUM,
    LARGE
}

export function pointToLongLat(point: string): LatLon | null {
    const regex = /\((-?\d+.?\d+) (-?\d+.?\d+)\)/;
    const found = point.match(regex);
    if (found) {
        return {
            longitude: Number(found[1]),
            latitude: Number(found[2])
        };
    }
    return null;
}

export function mapResultToImage(data: any): Image[] {
    const result: Image[] = data.map((item: any) => {
        return {
            id: item.id,
            themeId: item.theme_id,
            sourceType: item.source_type,
            source: item.source, 
            location: pointToLongLat(item.location),
            description: item.description                 
        }
    });
    return result;
}

@Injectable({providedIn: 'root'})
export class ImageService {
    constructor(private supabaseService: SupabaseService) { }
   
    public async insert(images:  Partial<Image>[]): Promise<Image[] |  Error> {
        const updateTime = new Date();
        const insertAry = images.map(image => {
            return {
                theme_id: image.themeId,
                updated_at: updateTime,
                source_type: image.sourceType,
                source: image.source, 
                location: `POINT(${image.location?.longitude} ${image.location?.latitude})`,
                description: image.description
            }
        });
        console.log('Insert images', insertAry);
        const { data, error } = await this.supabaseService.supabase
        .from('image')
        .insert(insertAry).select();

        handleError('Insert Image', error);
        const result = mapResultToImage(data);
        return new Promise((resolve) => {resolve(result)});
    }

    public async delete(imageId: number): Promise<void | Error> {
        const { error } = await this.supabaseService.supabase
            .from('image')
            .delete()
            .eq('id', imageId);

        handleError('Delete Image', error);
        return new Promise((resolve) => {resolve()});
    }

}