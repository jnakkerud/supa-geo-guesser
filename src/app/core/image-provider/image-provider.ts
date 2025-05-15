import { SupabaseService } from '../supabase-service/supabase.service';
import { handleError } from '../utils';
import { mapResultToImage, Image, ImageSize } from '../image-service/image.service';
import { Theme } from '../theme-service/theme.service';

function shuffle(array: Image[]): Image[] {
    // tslint:disable-next-line: one-variable-per-declaration
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export abstract class ImageProvider {
    
    _images!: Image[];
    _currentImageIndex = 0;

    constructor(public supabaseService: SupabaseService) {}

    public async loadImages(theme: Theme, shuffleImages = false): Promise<Image[]> {
        const { data, error } = await this.supabaseService.supabase.rpc('images_in_theme',
            {themeid: theme.id}
        );
   
        try {
            handleError('', error);
            this._currentImageIndex = 0;
            this._images = mapResultToImage(data);
            if (shuffleImages) {
                this._images = shuffle(this._images);
            }
            return new Promise((resolve) => {resolve(this._images)});                
        } catch (error) {
            return new Promise((resolve) => {resolve([])});                
        }
    }

    public nextImage(): Image {
        this._currentImageIndex = (this._currentImageIndex+1)%this._images.length;
        return this._images[this._currentImageIndex];
    }
    
    public get currentImageIndex(): number {
        return this._currentImageIndex;
    }

    public get images(): Image[] {
        return this._images;
    }

    public currentImage(): Image {
        return this._images[this._currentImageIndex];
    }

    public hasMoreImages(): boolean {
        return this._currentImageIndex < this._images.length - 1;
    }

    public abstract getImageUrl(image: Partial<Image>, size: ImageSize): string;

    // Used when adding an image to to the database
    public abstract getImageInfo(source: string ): Promise<any>;
}