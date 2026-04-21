import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // signal-based counter
  counter = signal(0);

  increment() {
    this.counter.update((n) => n + 1);
  }

  reset() {
    this.counter.set(0);
  }
}
