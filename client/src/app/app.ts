import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ScrollTop} from 'primeng/scrolltop';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTop, Toast],
  templateUrl: './app.html',
})
export class App {

}
