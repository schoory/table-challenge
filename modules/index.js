
/**
 * Генерирует случайную дату
 * @param {Date} start Начальная дата
 * @param {Date} end Конечная дата
 * @param {number} startHour Начальное время
 * @param {number} endHour Конечное время
 * @returns Возвращает случайную дату
 */
const genRandomDate = (start, end) => {
  const date = new Date(+start + Math.random() * (end - start));
  date.setSeconds(0, 0)
  return date;
}

/**
 * Генерирует случайное число
 * @param {number} min Минимальное число
 * @param {number} max Максимальное число
 * @returns Возвращает случайное число
 */
const genRandomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}

/**
 * Валидация параметров фильтра
 * @param {string} field Фильтруемое поле
 * @param {string} action Условие
 * @param {string} value Значение
 * @returns Возвращает `true`, если валидация пройдена, иначе `false`
 */
const isFilterValide = (field, action, value) => {
  if (field === 'date') {
    if (isNaN(new Date(value))) {
      return false
    }
    if (!['=', '<', '>'].includes(action)) {
      return false
    }
  }
  if (field === 'amount' || field === 'distance') {
    if (isNaN(+value)) {
      return false
    }
    if (!['=', '<', '>'].includes(action)) {
      return false
    }
  }
  return true
}

/**
 * Генерирует фильтр для таблицы
 * @param {string} field Фильтруемое поле 
 * @param {string} action Условие
 * @param {string} value Значение 
 */
const genTableFilter = (field, action, value) => {
  let result = 'WHERE '
  switch (field) {
    case 'date':
      const dateValue = new Date(value) 
      result += `${field} ${action} ${dateValue.getTime()} `
      break;
    case 'name': 
      result += `${field} ${action} '${action === 'LIKE' ? '%' + value + '%' : value }' `
      break;
    case 'amount': 
      result += `${field} ${action} ${value} `
      break;
    case 'distance': 
      result += `${field} ${action} ${value} `
      break;
  
    default:
      break;
  }
  return result
}

module.exports = { genRandomDate, genRandomNumber, genTableFilter, isFilterValide }