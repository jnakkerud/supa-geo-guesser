import { ImageProvider } from "../image-provider/image-provider";
import { Image, ImageSize } from "../image-service/image.service";
import { FlickrService } from "./flickr.service";
import { SupabaseService } from "../supabase-service/supabase.service";
import { SourceType } from "../utils";

const ERROR_IMAGE: Image = {
    id: -1,
    location: {latitude:1,longitude:1},
    source:  {id: '348695565', secret: 'b2a60d594f', serverId: '153'},
    sourceType: SourceType.FLICKR,
    themeId: -1,
    description: 'Error loading image'
};

export class FlickerImageProvider extends ImageProvider {

    constructor(public override supabaseService: SupabaseService, public flickrService: FlickrService) {
        super(supabaseService);
    }

    public override getImageUrl(image: Partial<Image>, size: ImageSize): string {
        try {
            // TODO not here for url?
            if (image.sourceType == SourceType.URL) {
                return image.source.url;
            }
            return this.flickrService.getImageUrl(image, size);

        } catch (error) {
            console.error(`Unable to get image URL for ${image.source}`, error);
        }
        return this.flickrService.getImageUrl(ERROR_IMAGE, size);
    }

    public override getImageInfo(source: string): Promise<any> {
        return this.flickrService.getInfo(source);
    }    
}