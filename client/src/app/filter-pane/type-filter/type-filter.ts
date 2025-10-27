import {Component, inject, OnInit, signal} from '@angular/core';
import {GuidelinesService} from '../../api/guidelines.service';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Checkbox} from 'primeng/checkbox';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-type-filter',
  imports: [
    Checkbox,
    ReactiveFormsModule,
    TitleCasePipe
  ],
  templateUrl: './type-filter.html',
})
export class TypeFilter implements OnInit {

  guidelines = inject(GuidelinesService);

  protected types = signal<string[]>([]);

  form = new FormGroup({});


  async ngOnInit(): Promise<void> {
    const g = await this.guidelines.get();
    this.types.set(g.entity.types)

    this.types().forEach(type => {
      this.form.addControl(type, new FormControl<boolean>(false, {nonNullable: true}));
    })
  }
}
