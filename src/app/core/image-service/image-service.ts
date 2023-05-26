import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase-service/supabase-service';
import { handleError } from '../utils';
import { FlickrService } from '../flickr-service/flickr.service';

export interface Image {
    id: number;
    themeId: number;
    sourceType: SourceType;
    source: any;
    location: LongLat;
    description?: string;
}

export interface LongLat {
    longitude: number;
    latitude: number;
}

export enum SourceType {
    URL = 'url',
    STORED = 'stored',
    FLICKR = 'flickr'
}

export enum ImageSize {
    SMALL,
    MEDIUM,
    LARGE
}

export function pointToLongLat(point: string): LongLat | null {
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

@Injectable({providedIn: 'root'})
export class ImageService {
    constructor(private supabaseService: SupabaseService, private flickrService: FlickrService) { }
 
    public async images(themeId: number): Promise<Image[]> {
        const { data, error } = await this.supabaseService.supabase.rpc('images_in_theme',
            {themeid: themeId}
        );
   
        try {
            handleError('', error);
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

            return new Promise((resolve) => {resolve(result)});                
        } catch (error) {
            return new Promise((resolve) => {resolve([])});                
        }
    }
   
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
        let result: Image[] = Object.assign([] as Image[], data);
        return new Promise((resolve) => {resolve(result)});
    }
    
    public getImageUrl(image: Image, size: ImageSize): string {
        if (image.sourceType == SourceType.FLICKR) {
            return this.flickrService.getImageUrl(image, size);
        }
        return 'https://live.staticflickr.com/65535/52793526908_c11769cd0c_n.jpg';
    }
}