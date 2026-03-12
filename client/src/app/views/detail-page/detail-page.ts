import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Annotation, Entity, IGuidelines } from '../../../interfaces';
import { TableModule } from 'primeng/table';
import { GuidelinesService } from '../../api/guidelines.service';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-detail-page',
  imports: [TableModule, Chip],
  templateUrl: './detail-page.html',
})
export class DetailPage implements OnInit {
  private guidelinesService = inject(GuidelinesService);

  entity = input.required<Entity>();
  annotations = input.required<Annotation[]>();

  guidelines = signal<IGuidelines | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    this.guidelines.set(await this.guidelinesService.get());
  }

  protected readonly Array = Array;
}
