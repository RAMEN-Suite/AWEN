import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { CreateEntityService } from '../create-entity.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { GAttribute } from '../../../interfaces';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { Router } from '@angular/router';
import { UtilsService } from '../../utils/utils.service';

@Component({
  selector: 'app-create-entity-form',
  imports: [
    Select,
    ReactiveFormsModule,
    FloatLabel,
    AttributeForm,
    ButtonDirective,
  ],
  templateUrl: './create-entity-form.html',
})
export class CreateEntityForm {
  private readonly createEntityService = inject(CreateEntityService);
  private readonly utilService = inject(UtilsService);
  private readonly router = inject(Router);
  private dialogRef = inject(DynamicDialogRef);

  private confirmationService = inject(ConfirmationService);

  public preselectedType = input<string>();

  protected readonly types: Signal<string[]> =
    this.createEntityService.getEntityTypes();
  protected readonly typesLoaded: Signal<boolean> =
    this.createEntityService.getEntityTypesLoaded();
  protected readonly properties: WritableSignal<GAttribute[]> = signal<
    GAttribute[]
  >([]);
  private readonly propertiesLoaded: WritableSignal<boolean> =
    signal<boolean>(true); // TODO: UI Loading state
  protected loading = signal<boolean>(false);

  protected attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  protected typeInput = new FormControl('', { nonNullable: true });

  protected propertiesForm = computed(() =>
    this.attributeForm().propertiesForm(),
  );

  public constructor() {
    effect(() => {
      const type = this.preselectedType();
      if (type) {
        this.typeInput.setValue(type, { emitEvent: false });
        void this.loadAndDisplayPropertyInputs(type);
      }
    });
    this.typeInput.valueChanges.subscribe((value) => {
      void this.loadAndDisplayPropertyInputs(value);
    });
  }

  private async loadAndDisplayPropertyInputs(type: string) {
    this.propertiesLoaded.set(false);
    const props: GAttribute[] =
      await this.createEntityService.getEntityProperties(type);
    this.properties.set(props);
    this.propertiesLoaded.set(true);
  }

  protected async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    try {
      this.loading.set(true);
      const createdId = await this.createEntityService.createEntity(
        this.typeInput.value,
        this.utilService.createPayload(
          this.propertiesForm().value,
          this.properties(),
        ),
      );
      this.confirmationService.confirm({
        message: 'The Entity was successfully created!',
        header: 'Success',
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
          label: 'Stay here',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Go to Entity',
          severity: 'primary',
        },

        accept: async () => {
          await this.router.navigate(['entity', createdId]);
          this.dialogRef.close();
          this.loading.set(false);
        },
        reject: () => {
          this.dialogRef.close();
          this.loading.set(false);
        },
      });
    } catch {
      this.loading.set(false);
      /* empty - Msg is displayed via Entity API */
    }
  }
}
