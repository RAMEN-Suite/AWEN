import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ScrollTop} from 'primeng/scrolltop';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTop, Toast],
  providers: [MessageService],
  templateUrl: './app.html',
})
export class App {

}
