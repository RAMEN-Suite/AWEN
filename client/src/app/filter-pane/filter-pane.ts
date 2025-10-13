import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from 'primeng/autocomplete';
import {Message} from 'primeng/message';
import {SearchService} from '../views/search/search.service';
import {Button} from 'primeng/button';
import {EntityNames} from '../../interfaces';

@Component({
  selector: 'app-filter-pane',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    Message,
    Button
  ],
  templateUrl: './filter-pane.html',
})
export class FilterPane {

  searchService = inject(SearchService);

  form: FormGroup<{
    search: FormControl;
  }> = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  suggestions= signal<EntityNames[] >([]);

  async autocompleteChanges(e: AutoCompleteCompleteEvent) {
    if (this.form.valid) {
      const suggestions = await this.searchService.getSuggestions(e.query);
      this.suggestions.set(suggestions);
    } else {
      this.suggestions.set([]);
    }
  }

  onSubmit() {
    if (this.form.valid) {
    } else {
      Object.entries(this.form.controls).forEach(([_, value]) => {
        value.markAsTouched()
      })
    }
  }
}
