// тип сортировки
export type Sort = { field: string, type: string } | null

// тип условия фильтра
export type FilterActionType = {
  label: string,
  action: string
}

// Список возможных условий фильтра
export const FilterActions: Readonly<FilterActionType[]> = [
  { label: 'Равно', action: '=' },
  { label: 'Содержит', action: 'LIKE' },
  { label: 'Больше', action: '>' },
  { label: 'Меньше', action: '<' }
]

// тип фильтра
export type Filter = { 
  apply: boolean,
  column: Column, 
  action: FilterActionType, 
  value: string 
}

// тип колонки таблицы
export type Column = {
  name: string,
  label: string,
  type: string
}

// тип элемента таблицы
export type Item = {
  [key: string]: string | Date | number,
  date: Date,
  name: string,
  amount: number,
  distance: number | string
}