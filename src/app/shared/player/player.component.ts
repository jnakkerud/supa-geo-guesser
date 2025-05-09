import { Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl,ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';
import { PlayerService, Player } from 'src/app/core/player-service/player.service';

@Component({
    selector: 'player',
    templateUrl: 'player.component.html',
    styleUrls: ['player.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule       
    ]    
})
export class PlayerComponent implements OnInit {
    player: Player | null = null;

    name = new FormControl('',[Validators.required, Validators.minLength(3),Validators.maxLength(20)]);

    errorMessage = signal('');

    constructor(private playerService: PlayerService) {
        merge(this.name.statusChanges, this.name.valueChanges)
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.updateErrorMessage());        
    }

    ngOnInit(): void {
        this.playerService.getPlayer().then((player) => {
            this.player = player;
        }).catch((error) => {
            console.error('Error getting player', error.message);
        });
    }

    savePlayerName(): void {
        if (this.name.valid) {
            const playerName = this.name.value;
            this.playerService.addPlayer(playerName!).then((result) => {
                this.player = result as Player;                
            }).catch((error) => {
                if (error instanceof Error) {
                    // Invalidate the name field with error from server
                    this.name.setErrors({ 'server': error.message });
                }
            });
        }            
    }

    updateErrorMessage() {
        if (this.name.hasError('required')) {
            this.errorMessage.set('You must enter a value');
        } else if (this.name.hasError('maxlength') || this.name.hasError('minlength')) {
            this.errorMessage.set('Name must be between 3 and 20 characters');
        } else if (this.name.hasError('server')) {
            this.errorMessage.set(this.name.getError('server'));
        } else {
            this.errorMessage.set('');
        }
    }
}