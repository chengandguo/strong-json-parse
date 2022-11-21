export default function head<T>(arr: T[]) : T {
  return arr.length ? arr[0] : undefined;
}
