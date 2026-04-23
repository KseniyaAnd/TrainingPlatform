import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Banner } from './banner/banner';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ButtonModule, Banner],
  templateUrl: './home.html',
})
export class HomePageComponent {}
