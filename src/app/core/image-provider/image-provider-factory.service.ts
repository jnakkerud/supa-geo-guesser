import { Injectable } from '@angular/core';
import { ImageProvider } from './image-provider';
import { Theme } from '../theme-service/theme.service';
import { FlickerImageProvider } from '../flickr-service/flickr-image-provider';
import { SupabaseService } from '../supabase-service/supabase.service';
import { FlickrService } from '../flickr-service/flickr.service';
import { SourceType } from '../utils';

@Injectable({providedIn: 'root'})
export class ImageProviderFactoryService {

    constructor(private supabaseService: SupabaseService, private flickrService: FlickrService) {}

    public create(theme: Theme): ImageProvider {
        if (theme.sourceType == SourceType.FLICKR) {
            return new FlickerImageProvider(this.supabaseService, this.flickrService);
        } else {
            throw new Error(`Unavailable source type: ${theme.sourceType}`);
        }
    }

}