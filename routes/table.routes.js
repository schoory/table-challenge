const { Router } = require('express')
const postgreClient = require('../database/postgresql')
const router = Router()

const { genRandomDate, genRandomNumber, isFilterValide, genTableFilter } = require('../modules/index')

// Возвращает строки таблицы с учетом лимита строк и текущей страницы согласно выставленной сортировки и фильтра
// Путь: /api/table/getData
router.get('/getData', async (req, res) => {
  try {
    const { limit, page, sortfield, sorttype, filterfield, filteraction, filtervalue } = req.query

    // Генерация запроса
    let query = `
    SELECT 
      challenge_table.date, challenge_table.name, challenge_table.amount, challenge_table.distance 
    FROM 
      challenge_table
    `

    // Добавление фильтра
    if (filterfield && filteraction && filtervalue) {
      if (isFilterValide(filterfield, filteraction, filtervalue)) {
        query += genTableFilter(filterfield, filteraction, filtervalue)
      } else {
        return res.status(400).json({ error: true, msg: 'Некорректный фильтр' })
      }
    }

    // Добавление сортировки
    if (sortfield && sorttype) {
      query += `ORDER BY challenge_table.${sortfield} ${sorttype} `
    } else {
      query += `ORDER BY challenge_table.date ASC `
    }

    if (limit && page) {
      query += `LIMIT ${limit} OFFSET ${(limit * (page - 1))}`
    }

    // Получение данных из таблицы
    const items = (await postgreClient.query(query)).rows

    return res.status(200).json({ error: false, items: items })
  } catch(error) {
    return res.status(500).json({ error: true, msg: 'Ошибка сервера' })
  }
})

// Возвращает количество доступных страниц в зависимости от лимита строк и фильтра
// Путь: /api/table/getNumberOfPages
router.get('/getNumberOfPages', async (req, res) => {
  try {
    const { limit, filterfield, filteraction, filtervalue } = req.query

    // Генерация запроса
    let query = `
    SELECT 
      COUNT(challenge_table.date) 
    FROM 
      challenge_table
    `

    // Добавление фильтра
    if (filterfield && filteraction && filtervalue) {
      if (isFilterValide(filterfield, filteraction, filtervalue)) {
        query += genTableFilter(filterfield, filteraction, filtervalue)
      } else {
        return res.status(400).json({ error: true, msg: 'Некорректный фильтр' })
      }
    }

    // Получение количества элементов в таблице
    const items = (await postgreClient.query(query)).rows[0]

    // Количество страниц
    const numberOfPages = +items.count === 0 
      ? 1
      : Math.floor(+items.count / limit) + (+items.count % limit === 0 ? 0 : 1)
        
    return res.status(200).json({ error: false, numberOfPages: numberOfPages })
  } catch(error) {
    return res.status(500).json({ error: true, msg: 'Ошибка сервера' })
  }
})

// Генерирует случайные данные в таблицу
// Путь: /api/table/generateRandomData
router.post('/generateRandomData', async (req, res) => {
  try {
    const { amount } = req.body

    // генерация запроса
    let query = 'INSERT INTO challenge_table (date, name, amount, distance) VALUES '
    for (let i = 0; i < amount; i++) {
      const date = genRandomDate(new Date(2000, 01, 01), new Date()) // получение случайной даты
      query += `('${date.getTime()}', 'Случайное название ${i}', ${genRandomNumber(1, 50)}, ${genRandomNumber(1, 350)})`
      if (i + 1 < amount) {
        query += ', '
      }
    }
    postgreClient.query(query) // выполнение запроса
    return res.status(200).json({ error: false })
  } catch(error) {
    return res.status(500).json({ error: true, msg: 'Ошибка сервера' })
  }
})

module.exports = router
