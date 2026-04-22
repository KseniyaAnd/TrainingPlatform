import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './home.html',
})
export class HomePageComponent {}
