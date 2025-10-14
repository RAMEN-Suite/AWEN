import {Component, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from 'primeng/autocomplete';
import {Message} from 'primeng/message';
import {SearchService} from '../views/search/search.service';
import {Button} from 'primeng/button';
import {EntityNames} from '../../interfaces';
import {GuidelinesService} from '../api/guidelines.service';
import {CollectionService} from '../api/collection.service';

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
export class FilterPane implements OnInit {

  searchService = inject(SearchService);
  collectionService = inject(CollectionService);
  guidelines = inject(GuidelinesService);

  form: FormGroup<{
    search: FormControl;
    collectionFilter: FormGroup
  }> = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
    collectionFilter: new FormGroup({})
  });

  collectionFilterOptions = signal<Record<string, {id: string, label: string}[]>>({});

  suggestions= signal<EntityNames[] >([]);
  showEmptyMessage = signal<boolean>(false);

  async ngOnInit() {
    this.collectionService.getFilterable().subscribe(value => {
      this.collectionFilterOptions.set(value.collectionFilter);
      for (const collection in value.collectionFilter) {
        this.form.controls.collectionFilter.addControl(collection, [''])
      }
    });

  }

  async autocompleteChanges(e: AutoCompleteCompleteEvent) {
    if (this.form.valid) {
      const suggestions = await this.searchService.getSuggestions(e.query);
      this.suggestions.set(suggestions);
    } else {
      this.suggestions.set([]);
    }
    this.showEmptyMessage.set(this.calcShowEmptyMessage());
  }

  onSubmit() {
    if (this.form.valid) {
    } else {
      Object.entries(this.form.controls).forEach(([_, value]) => {
        value.markAsTouched()
      })
    }
  }

  private calcShowEmptyMessage() {
    return (this.form.controls.search.valid && this.suggestions().length === 0);
  }
}
