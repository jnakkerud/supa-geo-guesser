import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'count-down',
    template: `<span>00:{{ secondsLeft | number:'2.0-0' }}&nbsp;{{message}}</span>`,
    standalone: true,
    imports: [CommonModule],
    styles: [`
        :host {
            font-family: 'PressStart2P', sans-serif;
            font-size: 30px;
        }
    `],
})
export class CountDownComponent implements OnInit, OnDestroy {
    @Input() seconds = 10;
    @Output() complete = new EventEmitter<void>();

    secondsLeft!: number;
    private intervalId: any;
    message = 'Time left';

    ngOnInit() {
        this.secondsLeft = this.seconds;
        this.intervalId = setInterval(() => {
            this.secondsLeft--;
            if (this.secondsLeft <= 0) {
                this.message = 'Game over!';
                this.complete.emit();
                this.clearTimer();
            }
        }, 1000);
    }

    ngOnDestroy() {
        this.clearTimer();
    }

    private clearTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}