import { Injectable, signal } from '@angular/core';
import { DataType } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DataTypeService {
  private readonly _dataTypes = signal<DataType[]>([]);
}
