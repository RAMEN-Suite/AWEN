import {inject, Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {firstValueFrom, lastValueFrom, map} from 'rxjs';

const GET_SUGGESTIONS = gql`
  query Query($name: String!) {
    entityNamesByName(name: $name) {
      name,
      id
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apollo = inject(Apollo);

  async getSuggestions(search: string) {
    const temp = this.apollo.watchQuery<{entityNamesByName: { name: string; id: string }[]}>({
      query: GET_SUGGESTIONS,
      variables: {
        name: search,
      },
    }).valueChanges
      .pipe(
        map(res => {
          return res.data.entityNamesByName;
        }),
      );


    return firstValueFrom(temp);
  }


  private transformSuggestions(entities: any[]): { name: string; id: string }[] {
    return entities.map((entity) => {
      // TODO: guidelines
      return {
        name: entity.properties.label,
        id: entity.properties.id,
      }
    })
  }

}
