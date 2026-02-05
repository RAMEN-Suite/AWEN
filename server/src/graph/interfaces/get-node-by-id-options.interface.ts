export interface GetNodeByIdOptions {
  /**
   * @remarks
   * **Security warning:** For performance reasons labels are injected directly into the Cypher query.
   * Do not pass user input.
   */
  labels?: string | string[];
}
