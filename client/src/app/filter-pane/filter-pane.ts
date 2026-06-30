import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { Message } from 'primeng/message';
import { SearchEntityService } from '../search-entity.service';
import { Button } from 'primeng/button';
import {
  CollectionName,
  EntityAutocompleteQuery,
  EntityNames,
  EntitySearchQuery,
} from '../../interfaces';
import { CollectionService } from '../api/collection.service';
import { Select } from 'primeng/select';
import { distinctUntilChanged, firstValueFrom, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TypeFilter } from './type-filter/type-filter';
import { RouterLink } from '@angular/router';
import { QueryParamsService } from '../utils/query-params.service';
import { ConfigService } from '../config-module/config.service';

interface CFOption {
  type: string;
  values: CollectionName[];
}

@Component({
  selector: 'app-filter-pane',
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    Message,
    Button,
    Select,
    TypeFilter,
    RouterLink,
  ],
  templateUrl: './filter-pane.html',
})
export class FilterPane {
  private destroyRef = inject(DestroyRef);

  searchService = inject(SearchEntityService);
  collectionService = inject(CollectionService);
  configService = inject(ConfigService);
  private queryParamService = inject(QueryParamsService);

  openLinkInNewTab = input<boolean>(false);
  setQueryParams = input<boolean>(false);

  remoteConfig = this.configService.getRemoteConfig();
  config = this.configService.getConfig();

  /** gesamte Kette aus Guidelines (vom spezifischsten → generischsten) */
  private collectionChain: string[] = [];
  /** nur filterbare Typen, in UI-Reihenfolge (generisch → spezifisch) */
  private activeChain: string[] = [];

  form = new FormGroup<{
    label: FormControl<string>;
    collectionFilter: FormGroup<
      Record<string, FormControl<CollectionName | null>>
    >;
    types: FormControl<string[]>;
  }>({
    label: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    collectionFilter: new FormGroup<
      Record<string, FormControl<CollectionName | null>>
    >({}),
    types: new FormControl<string[]>([], { nonNullable: true }),
  });

  collectionFilterOptions = signal<CFOption[]>([]);
  suggestions = signal<EntityNames[]>([]);
  showEmptyMessage = signal<boolean>(false);

  constructor() {
    effect(() => {
      const opts = this.collectionFilterOptions();
      opts.forEach((opt) => {
        if (opt.values.length > 0) {
          this.form.controls.collectionFilter
            .get(opt.type)
            ?.enable({ emitEvent: false });
        }
      });
    });
    effect(async () => {
      // Guidelines: letzter Eintrag ist generischster → UI startet dort
      // Also Kette umdrehen, damit Index 0 = generischster Typ ist.
      this.collectionChain = this.config().selectedCollectionChain; // [...g.scenarios.findByCollection.collectionChain].reverse();

      // Nur die filterbaren Typen zeigen
      const filterable: string[] = this.config().filterableCollections; // g.scenarios.findByCollection.filterable;
      this.activeChain = this.collectionChain.filter((t) =>
        filterable.includes(t),
      );

      // 1) Controls & Options nur für activeChain anlegen
      const optionsInit: CFOption[] = [];
      for (const type of this.activeChain) {
        this.form.controls.collectionFilter.addControl(
          type,
          new FormControl<CollectionName | null>({
            value: null,
            disabled: true,
          }),
        );
        optionsInit.push({ type, values: [] });
      }
      this.collectionFilterOptions.set(optionsInit);

      // 2) Erstes (generischstes) Select befüllen & enablen
      if (this.activeChain.length > 0) {
        await this.loadAndSetOptionsAt(0 /* generischstes Level */);
        this.enableAt(0, true);
      }

      // 3) Änderungen kaskadieren – nur für vorhandene Controls
      this.activeChain.forEach((type, idx) => {
        const ctrl = this.form.controls.collectionFilter.get(type);
        if (!ctrl) return;
        ctrl.valueChanges
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            map((v: CollectionName | null) => v?.id ?? null), // nur id betrachten
            distinctUntilChanged(),
          )
          .subscribe(async (idOrNull) => {
            const value = idOrNull
              ? (this.form.controls.collectionFilter.get(type)
                  ?.value as CollectionName)
              : null;
            await this.onLevelChanged(idx, value);
          });
      });

      // Fill form
      const queryParamValues: Record<string, never> =
        await this.queryParamService.readDecodedQueryParams();
      this.fillForm(this.form, queryParamValues);
      if (Object.keys(queryParamValues).length > 0) {
        await this.onSubmit();
      }
    });
  }

  async autocompleteChanges(e: AutoCompleteCompleteEvent) {
    if (this.form.valid) {
      const types = this.form.controls.types.value;
      const collectionFilter = this.form.controls.collectionFilter.value;
      const formatted: Record<string, string[]> = {};

      for (const key of Object.keys(collectionFilter)) {
        const id = collectionFilter[key]?.id;
        if (id) formatted[key] = [id];
      }

      const query: EntityAutocompleteQuery = { types: types };

      if (Object.keys(formatted).length > 0) {
        query.collectionFilter = formatted;
      }
      const suggestions = await this.searchService.getSuggestions(
        e.query,
        query,
      );
      this.suggestions.set(suggestions);
    } else {
      this.suggestions.set([]);
    }
    this.showEmptyMessage.set(this.calcShowEmptyMessage());
  }

  async onSubmit() {
    if (!this.form.valid) {
      Object.values(this.form.controls).forEach((ctrl) => ctrl.markAsTouched());
      return;
    }

    const label = this.form.controls.label.value;
    const types = this.form.controls.types.value;
    const collectionFilter = this.form.controls.collectionFilter.value;
    const formatted: Record<string, string[]> = {};

    for (const key of Object.keys(collectionFilter)) {
      const id = collectionFilter[key]?.id;
      if (id) formatted[key] = [id];
    }

    const query: EntitySearchQuery = { label: label, types: types };

    if (Object.keys(formatted).length > 0) {
      query.collectionFilter = formatted;
    }

    await this.searchService.searchEntities(query);
    if (this.setQueryParams()) {
      const queryParams = this.queryParamService.transformQueryParams(
        this.form.value,
      );
      await this.queryParamService.setQueryParams(queryParams);
    }
  }

  private calcShowEmptyMessage() {
    return this.form.controls.label.valid && this.suggestions().length === 0;
  }

  /** Änderung an Ebene `idx` in der activeChain */
  private async onLevelChanged(idx: number, value: CollectionName | null) {
    if (value) {
      // Elternwert gesetzt → alle tieferen Ebenen leeren
      this.clearFromIndex(idx + 1);
      // Nächstes (filterbares) Level befüllen & enablen
      if (idx + 1 < this.activeChain.length) {
        await this.loadAndSetOptionsAt(idx + 1, value.id);
        this.enableAt(idx + 1, true);
      }
    } else {
      // Wert entfernt → alles darunter leeren & disablen
      this.clearFromIndex(idx + 1);
    }
  }

  /** Options für Ebene `idx` laden (optional mit parentId) und ins Signal schreiben */
  private async loadAndSetOptionsAt(idx: number, parentId?: string) {
    const type = this.activeChain[idx];
    if (!type) return;
    const values = await firstValueFrom(
      this.collectionService.getFilterableByType(type, parentId),
    );
    this.setOptions(idx, values);
  }

  /** Options an Position idx ersetzen (immutabel) */
  private setOptions(idx: number, values: CollectionName[]) {
    const curr = this.collectionFilterOptions();
    const next = curr.map((o, i) => (i === idx ? { ...o, values } : o));
    this.collectionFilterOptions.set(next);
  }

  /** Ab startIdx: value=null, disable, options leeren */
  private clearFromIndex(startIdx: number) {
    const cfGroup = this.form.controls.collectionFilter;

    // Options leeren
    const nextOptions = this.collectionFilterOptions().map((o, i) =>
      i >= startIdx ? { ...o, values: [] } : o,
    );
    this.collectionFilterOptions.set(nextOptions);

    // Controls zurücksetzen & disablen
    for (let i = startIdx; i < this.activeChain.length; i++) {
      const type = this.activeChain[i];
      const ctrl = cfGroup.get(type);
      if (!ctrl) continue;
      ctrl.setValue(null, { emitEvent: false });
      ctrl.disable({ emitEvent: false });
    }
  }

  /** Enable/Disable Control an Index */
  private enableAt(idx: number, enable: boolean) {
    const type = this.activeChain[idx];
    if (!type) return;
    const ctrl = this.form.controls.collectionFilter.get(type);
    if (!ctrl) return;

    if (enable) {
      ctrl.enable({ emitEvent: false });
    } else {
      ctrl.disable({ emitEvent: false });
    }
  }

  protected onItemSelect(e: AutoCompleteSelectEvent) {
    this.form.controls.label.setValue(e.value.label);
  }

  private fillForm(form: FormGroup, values: Record<string, never>) {
    for (const key of Object.keys(form.controls)) {
      if (form.controls[key] instanceof FormGroup) {
        this.fillForm(form.controls[key], values[key]);
        continue;
      }

      let val = undefined;
      try {
        val = values[key];
      } catch {
        val = undefined;
      }

      if (val) {
        form.controls[key].setValue(val);
      }
    }

    return form;
  }

  private resetForm(): void {
    this.form.reset();
  }

  async resetFilterClicked(): Promise<void> {
    this.resetForm();
    this.searchService.resetEntityList();
    await this.queryParamService.setQueryParams({});
  }
}
