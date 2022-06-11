import axios from 'axios'
import { useState, useEffect, useRef } from 'react';
import './App.scss';
import { Table } from './components/Table/Table';
import { Filter, Sort, Item, Column, FilterActions } from './types';
import { Dropdown } from './components/Dropdown/Dropdown';


const ITEMS_LIMIT = 10 // Лимит выводимых строк

function App() {

  const [loading, setLoading] = useState(false) // флаг загрузки

  const [items, setItems] = useState<Item[]>([]) // элементы таблицы
  // колонки таблицы
  const [columns, setColumns] = useState<Column[]>([
    { name: 'date', label: 'Дата', type: 'date' }, 
    { name: 'name', label: 'Название', type: 'string' },
    { name: 'amount', label: 'Количество', type: 'number' },
    { name: 'distance', label: 'Расстояние', type: 'number' }
  ])

  const [currentPage, setCurrentPage] = useState(1) // текущая страница
  const [maxPage, setMaxPage] = useState(1) // количество страниц

  const [sort, setSort] = useState<Sort>(null) // значение сортировки

  // значение фильтра
  const [filter, setFilter] = useState<Filter>({ 
    apply: false, 
    column: {
      name: 'name',
      label: 'Название',
      type: 'string'
    }, 
    action: FilterActions[0], 
    value: '' 
  }) 

  // для работы выпадающих списков (ссылка на якорь, флаг видимости)
  const filterColumnAnchor = useRef(null)
  const [filterColumnVisible, setFilterColumnVisible] = useState(false)
  const filterActionAnchor = useRef(null)
  const [filterActionVisible, setFilterActionVisible] = useState(false)

  /**
   * Получает количество страниц
   * @param limit Лимит загружаемых элементов таблицы
   */
  const fetchNumberOfPages = async (limit: number, filter: Filter) : Promise<void> => {
    console.log(
      `/api/table/getNumberOfPages?limit=${limit}` +
      (filter.apply ? `&filterfield=${filter.column.name}&filteraction=${filter.action.action}&filtervalue=${filter.value}` : '')
    );
    await axios.get(
      `/api/table/getNumberOfPages?limit=${limit}` +
      (filter.apply ? `&filterfield=${filter.column.name}&filteraction=${filter.action.action}&filtervalue=${filter.value}` : '')
    ).then(({ data, status }) => {
      if (data.error || status !== 200) return console.log('Response error', status)
      setMaxPage(data.numberOfPages)
    })
  }

  /**
   * Получает элементы таблицы
   * @param limit Лимит загружаемых элементов таблицы
   * @param page Загружаемая страница
   */
  const fetchData = async (limit: number, page: number, sort: Sort = null, filter: Filter) : Promise<void> => {
    axios.get(
      `/api/table/getData?limit=${limit}&page=${page}` +
      (sort ? '&sortfield=' + sort.field + '&sorttype=' + sort.type : '') +
      (filter.apply ? `&filterfield=${filter.column.name}&filteraction=${filter.action.action}&filtervalue=${filter.value}` : '')
    ).then(({ data, status }) => {
      if (data.error || status !== 200) return console.log('Response error', status)
      setItems(data.items as Item[])
    })
  }

  // Initial fetch
  useEffect(() => {
    // Асинхронная функция
    const initialFetch = async () => {
      if (!loading) {
        setLoading(true)
        await fetchNumberOfPages(ITEMS_LIMIT, filter) // получение количества страниц таблицы
        await fetchData(ITEMS_LIMIT, currentPage, null, filter) // получение элементов таблицы
        setLoading(false)
      }
    }

    initialFetch()
  }, [])

  /**
   * Изменение страницы
   * @param page Новый номер страницы
   */
  const changePage = async (page: number) => {
    setLoading(true)
    await fetchData(ITEMS_LIMIT, page, sort, filter)
    setCurrentPage(page)
    setLoading(false)
  }

  /**
   * Сортирует таблицу по колонке
   * @param sortColumn Колонка, по которой сортируется таблица
   */
  const changeSort = async (sortColumn: string) => {
    setLoading(true)

    // если значение сортировки null и попытка вызвать сортировку с тем же значением
    if (!sort && sortColumn === 'date') return setLoading(false)

    let newSort: Sort = null // новая сортировка
    // если сортировка по полю даты - отмена сортировки
    if (sortColumn === 'date') {
      newSort = null
    } else {
      // если раньше не было отсортировано - ASC
      if (!sort) {
        newSort = { field: sortColumn, type: 'ASC' }
      } else {
        // если уже было отсортировано по этому полю, то меняется ASC на DESC и наоборот
        if (sort.field === sortColumn) {
          if (sort.type === 'ASC') {
            newSort = { field: sortColumn, type: 'DESC' }
          } else {
            newSort = { field: sortColumn, type: 'ASC' }
          }
        } else {
          // если было отсортировано не по этому полю, то применяется ASC
          newSort = { field: sortColumn, type: 'ASC' }
        }
      }
    }
    
    await fetchData(ITEMS_LIMIT, currentPage, newSort, filter)
    setSort(newSort)
    setLoading(false)
  }

  /**
   * Применяет фильтр
   */
  const applyFilter = async () => {
    const newFilter: Filter = { ...filter, apply: true }
    await fetchData(ITEMS_LIMIT, 1, sort, newFilter)
    await fetchNumberOfPages(ITEMS_LIMIT, newFilter)
    setCurrentPage(1)
    setFilter(newFilter)
  }

  /**
   * Отключает фильтр
   */
  const disableFilter = async () => {
    const newFilter: Filter = { ...filter, apply: false }
    await fetchData(ITEMS_LIMIT, 1, sort, newFilter)
    await fetchNumberOfPages(ITEMS_LIMIT, newFilter)
    setCurrentPage(1)
    setFilter(newFilter)
  }

  /**
   * Создает случайные данные и заносит их в таблицу
   * @param amountOfElements Количество элементов, которые будут созданы
   */
  const generateRandomData = async (amountOfElements: number) => {
    setLoading(true)
    await axios.post('/api/table/generateRandomData', { amount: amountOfElements }, { headers: { "Content-Type": "application/json" } })
    await fetchNumberOfPages(ITEMS_LIMIT, filter)
    setCurrentPage(1)
    await fetchData(ITEMS_LIMIT, 1, sort, filter)
    setLoading(false)
  }

  /**
   * Выводит список условий фильтра в зависимости от того, какая колонка таблицы выбрана для фильтрации
   * @returns Возвращает условия фильтра
   */
  const renderFilterActions = () : JSX.Element[] => {
    const items: JSX.Element[] = []
    FilterActions.forEach((filterAction, index) => {
      if (((filter.column.type === 'date' || filter.column.type === 'number') && filterAction.action !== 'LIKE') || filter.column.type === 'string') {
        items.push(
          <button className='app__dropdown-btn' key={index} onClick={() => { setFilter({ ...filter, action: filterAction }); setFilterActionVisible(false); }}>{filterAction.label}</button>
        )
      }
    })
    return items
  }

  return (
    <div className="app">
      <header className='app__header'>
        <button className="app__header-btn" onClick={() => generateRandomData(100)}>Сгенерировать случайные данные в таблицу</button>
      </header>
      <main className='app__content'>
        <div className='app__wrapper'>
          <div className="filters">
            <div className='filters__controls'>
              <div className='filters__control'>
                <p className="filters__control-label">Поле</p>
                <button className='filters__control-btn' disabled={filter.apply} ref={filterColumnAnchor} onClick={() => { setFilterColumnVisible(true); }}>{ filter.column.label }</button>
                <Dropdown
                  visible={filterColumnVisible}
                  anchor={filterColumnAnchor}
                  onClose={() => { setFilterColumnVisible(false) }}
                >
                  {
                    columns.map((column, index) => (
                      <button className='app__dropdown-btn' key={index} onClick={() => { setFilter({ apply: false, column: column, action: FilterActions[0], value: '' }); setFilterColumnVisible(false); }}>{column.label}</button>
                    ))
                  }
                </Dropdown>
              </div>
              <div className='filters__control'>
                <p className="filters__control-label">Фильтр</p>
                <button className='filters__control-btn' disabled={filter.apply} ref={filterActionAnchor} onClick={() => { setFilterActionVisible(true); }}>{ filter.action.label }</button>
                <Dropdown
                  visible={filterActionVisible}
                  anchor={filterActionAnchor}
                  onClose={() => { setFilterActionVisible(false) }}
                >
                  {
                    renderFilterActions()
                  }
                </Dropdown>
              </div>
              <div className='filters__control'>
                <p className="filters__control-label">Значение</p>
                <input 
                  type={
                    filter.column.type === 'string'
                      ? "text"
                      : filter.column.type === 'date'
                        ? "datetime-local"
                        : "number"
                  } 
                  disabled={filter.apply}
                  className='filters__control-input' 
                  value={filter.value} 
                  onInput={({ target }: React.ChangeEvent<HTMLInputElement>) => { setFilter({ ...filter, value: target.value }) }} 
                />
              </div>
              {
                filter.apply
                  ? <button className='filters__btn' style={{ width: '100%' }} onClick={disableFilter}>Отменить фильтр</button>
                  : <button className='filters__btn' style={{ width: '100%' }} onClick={applyFilter}>Применить фильтр</button>
              }
            </div>
          </div>
          <Table 
            columns={columns}
            items={items}
            currentPage={currentPage}
            changePage={changePage}
            changeSort={changeSort}
            maxPage={maxPage}
            loading={loading}
            sort={sort}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
