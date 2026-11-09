/** Per-request GraphQL context. Grows with auth (ctx.user) in add-workout-logging. */
export interface GraphQLContext {
  requestId: string;
}
