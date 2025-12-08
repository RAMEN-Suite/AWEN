import {Component, inject, input, OnInit, signal} from '@angular/core';
import {Entity, IGuidelines} from '../../../interfaces';
import {TableModule} from 'primeng/table';
import {GuidelinesService} from '../../api/guidelines.service';


@Component({
  selector: 'app-detail-page',
  imports: [
    TableModule
  ],
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnInit {

  private guidelinesService = inject(GuidelinesService)

  entity = input.required<Entity>()

  guidelines = signal<IGuidelines|undefined>(undefined);

  async ngOnInit(): Promise<void> {
    this.guidelines.set(await this.guidelinesService.get());
  }

  // TODO: aus den Guidelines extrahieren
  entityPropertiesTableFormat() {
    const propertiesConfig = this.guidelines()?.entity.properties ?? [];
    const eProperties = this.entity().properties;

    const propertyKeys = Object.keys(eProperties).sort()
      .filter(key => {
      const config = propertiesConfig.find(e => e.name === key);
      const val = eProperties[key];
      return !!(config && config.visible && val);
    }).map(key => {
      return {
        ...propertiesConfig.find(e => e.name === key),
        value: eProperties[key],
      };
    });

    return propertyKeys;
  }

  protected readonly Array = Array;
}
