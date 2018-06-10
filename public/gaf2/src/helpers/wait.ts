export function delay(ms: number) {
  return new Promise( (resolve: any) => setTimeout(resolve, ms) );
}
