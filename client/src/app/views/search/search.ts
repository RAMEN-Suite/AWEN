import {Component, inject, OnInit} from '@angular/core';
import {FilterPane} from '../../filter-pane/filter-pane';
import {SearchService} from './search.service';

@Component({
  selector: 'app-search',
  imports: [
    FilterPane
  ],
  providers: [
    SearchService
  ],
  templateUrl: './search.html',
})
export class Search {



}
