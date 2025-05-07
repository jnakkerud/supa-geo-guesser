import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlayerService, Player } from 'src/app/core/player-service/player.service';

@Component({
    selector: 'player',
    templateUrl: 'player.component.html',
    styleUrls: ['player.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatExpansionModule       
    ]    
})
export class PlayerComponent {
    player: Player;

    // Add your component logic here
    constructor(playerService: PlayerService) {
        this.player = playerService.getPlayer();
    }

}