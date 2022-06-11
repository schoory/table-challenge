import { FC, useEffect, useRef, useState } from "react"
import './Table.scss'
import { Spinner } from './../Spinner/Spinner';
import { Column, Item, Sort } from "../../types";

type TableProps = {
  columns: Column[],
  items: Item[],
  changePage: (newPage: number) => void,
  changeSort: (newSortColumn: string) => void
  currentPage: number,
  maxPage: number,
  loading?: boolean,
  sort: Sort
}

// Компонент таблицы
export const Table: FC<TableProps> = ({ columns, items, sort, changePage, changeSort, currentPage, maxPage, loading = false }) => {

  const tableListRef = useRef(null) // ref на лист таблицы
  const [isScrollVisible, setIsScrollVisible] = useState(false) // флаг видна ли полоса прокрутки

  // Проверка, если есть полоса прокрутки, то выставляет флаг, чтобы добавить отступ элементам
  useEffect(() => {
    if (tableListRef.current) {
      const scrollHeight = (tableListRef.current as HTMLDivElement).scrollHeight;
      const clientHeight = (tableListRef.current as HTMLDivElement).clientHeight;
      if (scrollHeight > clientHeight) {
        setIsScrollVisible(true)
      }
    }
  }, [columns, items])

  return (
    <div className='table'>
      
      <div className="table__headers">
        {
          columns.map((column, index) => (
            <div className="table__header" key={index} data-column-name={column.name} onClick={() => { changeSort(column.name) }}>
              {column.label}
              {
                sort && sort.field === column.name
                  ? (
                    <svg viewBox="0 0 24 24" style={ sort.type === 'ASC' ? { transform: 'rotate(180deg)' } : undefined }>
                      <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  )
                  : null
              }
            </div>
          ))
        }
      </div>

      {
        // Если загрузка, то вывод спиннера
        loading
          ? (
            <div className="table__loading-list">
              <Spinner />
            </div>
          )
          // если элементов в таблице нет, вывод сообщения
          : items.length === 0
            ? (
              <div className="table__empty-list">
                В таблице нет элементов
              </div>
            )
            // если элементы есть, вывод элементов
            : (
              <div className={["table__list", isScrollVisible ? 'table__list_scroll' : ''].join(' ')} ref={tableListRef}>
                {
                  items.map((item, index) => {
                    return (
                      <div className="table__row" key={index}>
                        {
                          columns.map((column, columnIndex) => {
                            const value = column.type === 'date' ? new Date(+item[column.name]).toLocaleString() : item[column.name].toString() 
                            return (
                              <div 
                                className="table__cell" 
                                key={index.toString() + columnIndex.toString()}
                              >{value}</div>
                            )
                          })
                        }
                      </div>
                    )
                  })
                }
              </div>
            )
      }
      
      <div className="table__footer">
        <div className="table__pagination">
          <button className="table__page-control" disabled={currentPage === 1} onClick={() => { changePage(currentPage - 1) }}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
            </svg>  
          </button>
          <div className="table__pagination-info">
            <p className="table__pagination-current">{currentPage}</p>
            <p className="table__pagination-divider">/</p>
            <p className="table__pagination-max">{maxPage}</p>
          </div>
          <button className="table__page-control" disabled={currentPage === maxPage} onClick={() => { changePage(currentPage + 1) }}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}