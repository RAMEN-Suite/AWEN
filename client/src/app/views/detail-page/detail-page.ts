import {Component, input, OnInit} from '@angular/core';
import {Entity} from '../../../interfaces';
import {TableModule} from 'primeng/table';


@Component({
  selector: 'app-detail-page',
  imports: [
    TableModule
  ],
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnInit {

  entity = input.required<Entity>()

  ngOnInit(): void {

  }

  // TODO: aus den Guidelines extrahieren
  entityPropertiesTableFormat() {

    return []
  }

}
