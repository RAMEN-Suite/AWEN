import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from 'primeng/autocomplete';
import {Message} from 'primeng/message';

@Component({
  selector: 'app-filter-pane',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    Message
  ],
  templateUrl: './filter-pane.html',
})
export class FilterPane {

  form: FormGroup<{
    search: FormControl;
  }> = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  suggestions: string[] = [];

  autocompleteChanges(e: AutoCompleteCompleteEvent) {

  }

  onSubmit() {

  }
}
