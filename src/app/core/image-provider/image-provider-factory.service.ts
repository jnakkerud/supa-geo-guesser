import { Injectable } from '@angular/core';
import { ImageProvider } from './image-provider';
import { FlickerImageProvider } from '../flickr-service/flickr-image-provider';
import { SupabaseService } from '../supabase-service/supabase.service';
import { FlickrService } from '../flickr-service/flickr.service';
import { SourceType } from '../utils';
import { FlickrGroupImageProvider } from '../flickr-service/flickr-group-image-provider';

@Injectable({providedIn: 'root'})
export class ImageProviderFactoryService {

    constructor(private supabaseService: SupabaseService, private flickrService: FlickrService) {}

    public create(sourceType: SourceType): ImageProvider {
        if (sourceType == SourceType.FLICKR) {
            return  new FlickerImageProvider(this.supabaseService, this.flickrService);
        }
        else if (sourceType == SourceType.FLICKR_GROUP) {
            return new FlickrGroupImageProvider(this.supabaseService, this.flickrService);
        } else {
            throw new Error(`Unavailable source type: ${sourceType}`);
        }
    }

}