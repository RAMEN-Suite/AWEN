import { Component, computed, inject, input } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleButton } from 'primeng/togglebutton';
import { ENTITY_NAME_PROPERTY } from '../../../constants';
import { EntityPropertyDto } from '../../../interfaces';
import { ConfigService } from '../../config-module/config.service';
import { EntityService } from '../../api/entity.service';
import { MessageService } from 'primeng/api';
import { KeyFilter } from 'primeng/keyfilter';

interface AttributeWithOptValue extends Omit<EntityPropertyDto, 'value'>, Partial<Pick<EntityPropertyDto, 'value'>> {}

@Component({
  selector: 'app-attribute-form',
  imports: [AutoComplete, FloatLabel, InputNumber, InputText, ReactiveFormsModule, ToggleButton, KeyFilter],
  templateUrl: './attribute-form.html',
})
export class AttributeForm {
  private readonly configService = inject(ConfigService);
  private readonly entityAPI = inject(EntityService);
  private readonly messageService = inject(MessageService);

  properties = input.required<AttributeWithOptValue[]>();
  formName = input.required<string>();
  enableCheckForSimilarLabels = input<boolean>(false);

  readonly propertiesForm = computed(() => {
    const props = this.properties();
    return this.buildFormGroup(props);
  });

  private buildFormGroup(props: AttributeWithOptValue[]) {
    const controlls: Record<string, FormControl> = {};

    for (const prop of props) {
      console.log(prop.name, prop.value);
      const formControl = this.createFormControl(prop);
      if (!formControl) continue;
      controlls[prop.name] = formControl;
    }

    return new FormGroup(controlls);
  }

  private createFormControl(prop: AttributeWithOptValue): FormControl | undefined {
    const dataType = this.findDataType(prop.typeId);
    if (!dataType) return undefined;

    const { lowerBound, upperBound } = prop.bounds;
    const isArray = this.isArray(prop.bounds);

    const validators = [...(lowerBound >= 1 ? [Validators.required] : [])];

    if (isArray) {
      validators.push(Validators.minLength(lowerBound), ...(upperBound !== -1 ? [Validators.maxLength(upperBound)] : []));
    }

    switch (dataType.name.toLowerCase()) {
      case 'string': {
        let val: string | string[] | null = isArray ? [] : null;
        if (prop.value) val = prop.value;
        return new FormControl<string | string[] | null>(val, { validators });
      }
      case 'integer':
      case 'float': {
        let val: number | number[] | null = isArray ? [] : null;
        if (prop.value) val = prop.value as unknown as number | number[] | null;
        console.log('float', prop.value, val);
        return new FormControl<number | number[] | null>(val, { validators });
      }
      case 'boolean': {
        let val: boolean | boolean[] = isArray ? new Array<boolean>() : false;
        if (prop.value) val = prop.value as unknown as boolean | boolean[];
        // @ts-expect-error ???
        return isArray ? new FormControl<boolean[]>(val, { validators }) : new FormControl<boolean>(val, { nonNullable: true });
      }
      default:
        return undefined;
    }
  }

  protected findDataType(id: string) {
    return this.configService.findDataType(id);
  }

  private isArray(bounds: { lowerBound: number; upperBound: number }): boolean {
    return bounds.upperBound === -1 || bounds.upperBound > 1;
  }

  async onLabelBlur(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value;
    if (this.enableCheckForSimilarLabels()) {
      await this.checkForSimilarLabels(value);
    }
  }

  private async checkForSimilarLabels(label: string) {
    if (label.length === 0) return;
    const similarEntities = await this.entityAPI.getAutocomplete(label);
    const detailMsg = similarEntities.map((entity) => `There is already an Entity named <b>${entity.label}</b>`);
    if (detailMsg.length === 0) return;
    this.messageService.add({
      severity: 'info',
      summary: 'Similar Label found',
      detail: detailMsg.join('\n'),
      life: 11000,
    });
  }

  protected readonly ENTITY_NAME_PROPERTY = ENTITY_NAME_PROPERTY;
}
