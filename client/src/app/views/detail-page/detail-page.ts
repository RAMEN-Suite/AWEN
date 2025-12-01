import {Component, input, OnInit} from '@angular/core';
import {Entity} from '../../../interfaces';

@Component({
  selector: 'app-detail-page',
  imports: [],
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnInit {

  entity = input.required<Entity>()

  ngOnInit(): void {
    console.log(this.entity);
  }

}
