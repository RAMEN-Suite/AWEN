import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
  viewChild,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CreateAnnotationService } from '../create-annotation.service';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Annotation, GAttribute } from '../../../interfaces';
import { CreateAnnotationConnection } from '../../create-annotation-connection/create-annotation-connection';
import { ConfirmationService } from 'primeng/api';
import { AnnotationApiService } from '../../api/annotation-api.service';
import { Select } from 'primeng/select';
import { AttributeForm } from '../../utils/attribute-form/attribute-form';
import { UtilsService } from '../../utils/utils.service';

// Using experimental Signal Form. Cause why not
@Component({
  selector: 'app-create-annotation-form',
  providers: [CreateAnnotationService],
  imports: [
    FloatLabel,
    FormsModule,
    ButtonDirective,
    Select,
    ReactiveFormsModule,
    AttributeForm,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './create-annotation-form.html',
})
export class CreateAnnotationForm {
  private readonly annotationApi = inject(AnnotationApiService);
  private readonly dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private readonly utilService = inject(UtilsService);
  private readonly createAnnotationService = inject(CreateAnnotationService);
  private readonly dialogRef = inject(DynamicDialogRef);
  private createAnnotationConnectionDialogRef: DynamicDialogRef<CreateAnnotationConnection> | null =
    null;

  protected readonly types: Signal<string[]> =
    this.createAnnotationService.getAnnotationTypes();
  public entityId = input.required<string>();
  protected readonly properties: WritableSignal<GAttribute[]> = signal<
    GAttribute[]
  >([]);
  protected loading = signal<boolean>(false);
  private readonly propertiesLoaded: WritableSignal<boolean> =
    signal<boolean>(true); // TODO: UI Loading state
  protected readonly typesLoaded: Signal<boolean> =
    this.createAnnotationService.geAnnotationTypesLoaded();

  private attributeForm = viewChild.required<AttributeForm>(AttributeForm);

  protected typeInput = new FormControl('', { nonNullable: true });

  protected propertiesForm = computed(() =>
    this.attributeForm().propertiesForm(),
  );

  public constructor() {
    // effect(async () => {
    //   const type = this.preselectedType();
    //   if (type) {
    //     this.typeInput.setValue(type, { emitEvent: false });
    //     await this.loadAndDisplayPropertyInputs(type);
    //   }
    // });
    effect(() => {
      const types = this.types();
      if (types[0]) {
        this.typeInput.setValue(types[0], { emitEvent: false });
        void this.loadAndDisplayPropertyInputs(types[0]);
      }
    });
    this.typeInput.valueChanges.subscribe((value) => {
      void this.loadAndDisplayPropertyInputs(value);
    });
  }

  private async loadAndDisplayPropertyInputs(type: string) {
    this.propertiesLoaded.set(false);
    const props: GAttribute[] =
      await this.createAnnotationService.getAnnotationProperties(type);
    this.properties.set(props);
    this.propertiesLoaded.set(true);
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    try {
      this.loading.set(true);
      const payload = this.utilService.createPayload(
        this.propertiesForm().value,
        this.properties(),
      );
      const annotationId =
        await this.createAnnotationService.createAnnotationForEntity(
          this.entityId(),
          this.typeInput.value,
          payload,
        );
      console.log(`Created Annotation ${annotationId}`);
      this.confirmationService.confirm({
        target: event.target ?? undefined,
        message: `Do you want to connect this annotation to an entity?`,
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
          label: 'No',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Yes',
          severity: 'primary',
        },
        accept: async () => {
          const annotation = await this.annotationApi.get(annotationId);
          this.clickCreateAnnotationConnection(annotation);
        },
      });
      this.dialogRef.close();
    } finally {
      this.loading.set(false);
    }
  }

  protected clickCreateAnnotationConnection(annotation: Annotation) {
    this.createAnnotationConnectionDialogRef = this.dialogService.open(
      CreateAnnotationConnection,
      {
        inputValues: {
          annotation: annotation,
        },
        header: 'Create An Optional Annotation Connection',
        styleClass: 'w-11 md:w-9 lg:w-8',
        style: {
          'min-height': '50vh',
        },
        contentStyle: {
          'padding-top': '0.5rem',
        },
        closable: true,
      },
    );
  }
}
