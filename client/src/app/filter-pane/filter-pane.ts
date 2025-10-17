import {Component, DestroyRef, effect, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AutoCompleteCompleteEvent, AutoCompleteModule} from 'primeng/autocomplete';
import {Message} from 'primeng/message';
import {SearchService} from '../views/search/search.service';
import {Button} from 'primeng/button';
import {CollectionName, EntityNames} from '../../interfaces';
import {GuidelinesService} from '../api/guidelines.service';
import {CollectionService} from '../api/collection.service';
import {Select} from 'primeng/select';
import {distinctUntilChanged, firstValueFrom} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


type CFOption = { type: string; values: CollectionName[] };

@Component({
  selector: 'app-filter-pane',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    Message,
    Button,
    Select
  ],
  templateUrl: './filter-pane.html',
})
export class FilterPane implements OnInit {
  private destroyRef = inject(DestroyRef);
  searchService = inject(SearchService);
  collectionService = inject(CollectionService);
  guidelines = inject(GuidelinesService);

  private collectionChain: string[] = [];

  constructor() {
    effect(() => {
      const o = this.collectionFilterOptions();
      o.forEach(filter => {
        if (filter.values.length > 0) {
          this.form.controls.collectionFilter.get(filter.type)?.enable();
        }
      })
    });
  }

  form: FormGroup<{
    search: FormControl<string>;
    collectionFilter: FormGroup<Record<string, FormControl<CollectionName | null>>>
  }> = new FormGroup({
    search: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    collectionFilter: new FormGroup<Record<string, FormControl<CollectionName | null>>>({})
  });

  collectionFilterOptions = signal<CFOption[]>([]);

  suggestions= signal<EntityNames[] >([]);
  showEmptyMessage = signal<boolean>(false);

  async ngOnInit() {
    const g = await this.guidelines.get();

    /**
     * TODO: Das kannste so nicht machen. Also das szenario ding ist nicht gut...
     */

    const filtCollectionTypes: string[] = g.scenarios.findByCollection.filterable;
    this.collectionChain = [...g.scenarios.findByCollection.collectionChain].reverse();

    // 1. create ALL inputs

    const optionsInit: CFOption[] = [];
    for (const type of this.collectionChain) {
      if (!filtCollectionTypes.includes(type)) continue;
      this.form.controls.collectionFilter.addControl(
        type,
        new FormControl<CollectionName | null>({ value: null, disabled: true })
      );
      optionsInit.push({ type, values: [] });
    }
    this.collectionFilterOptions.set(optionsInit);



    // 2. Fill first Input

    if (this.collectionChain.length > 0) {
      await this.loadAndSetOptionsAt(0);
      this.enableAt(0, true);
    }


    // 3. other inputs react on parent input change

    this.collectionChain.forEach((type, idx) => {
      this.form.controls.collectionFilter.get(type)?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
        .subscribe(value => this.onLevelChanged(idx, value));
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

  /** Reaktion auf eine Änderung an Ebene `idx` */
  private async onLevelChanged(idx: number, value: CollectionName | null) {
    if (value) {
      // Elternwert gewählt -> alle tieferen zurücksetzen
      this.clearFromIndex(idx + 1);
      // direktes Kind befüllen & aktivieren (falls vorhanden)
      if (idx + 1 < this.collectionChain.length) {
        await this.loadAndSetOptionsAt(idx + 1, value.id);
        this.enableAt(idx + 1, true);
      }
    } else {
      // Elternwert gelöscht -> alles darunter löschen & disablen
      this.clearFromIndex(idx + 1);
    }
  }

  /** Lädt Options für Ebene `idx` (optional mit parentId) und schreibt sie ins Signal */
  private async loadAndSetOptionsAt(idx: number, parentId?: string) {
    const type = this.collectionChain[idx];
    const values = await firstValueFrom(
      this.collectionService.getFilterableByType(type, parentId)
    );
    this.setOptions(idx, values);
  }

  /** Options an Position idx ersetzen (immutabel) */
  private setOptions(idx: number, values: CollectionName[]) {
    const curr = this.collectionFilterOptions();
    const next = curr.map((o, i) => (i === idx ? { ...o, values } : o));
    this.collectionFilterOptions.set(next);
  }

  /** Ab `startIdx` alle Controls: value=null, disable, options leeren */
  private clearFromIndex(startIdx: number) {
    const cfGroup = this.form.controls.collectionFilter;

    const nextOptions = this.collectionFilterOptions().map((o, i) => {
      if (i >= startIdx) return { ...o, values: [] };
      return o;
    });
    this.collectionFilterOptions.set(nextOptions);

    for (let i = startIdx; i < this.collectionChain.length; i++) {
      const type = this.collectionChain[i];
      const ctrl = cfGroup.get(type);
      ctrl?.setValue(null, { emitEvent: false }); // wichtig: keine Kaskaden-Schleife
      ctrl?.disable({ emitEvent: false });
    }
  }

  /** Enable/Disable Control an Index */
  private enableAt(idx: number, enable: boolean) {
    const type = this.collectionChain[idx];
    const ctrl = this.form.controls.collectionFilter.controls[type]!;
    if (enable) ctrl.enable({ emitEvent: false });
    else ctrl.disable({ emitEvent: false });
  }

}
