export type LengthArray<T, N extends number, A extends T[] = []> = A extends {
  length: N;
}
  ? A
  : LengthArray<T, N, [...A, T]>;

export type Entries<T> = [keyof T, T[keyof T]][];
