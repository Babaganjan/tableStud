const SERVER_URL = 'http://localhost:3000';

// Функция добавления и сохранения студента
async function addStudentServer(obj) {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  });

  const dataStudent = await response.json();
  return dataStudent;

}

// Функция запроса данных с сервера
async function getStudentServer() {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const dataStudent = await response.json();
  return dataStudent;

}

// Функция удаления студента с сервера
async function deleteStudentServer(id) {
  let response = await fetch(SERVER_URL + `/api/students/` + id, {
    method: 'DELETE',
  });
  console.log(response)
  const dataStudent = await response.json();
  return dataStudent;

}

// Присваеваем результат функции в переменную
let serverData = await getStudentServer();

// Пустой массив в который будут добавляться студенты если они есть на сервере
let students = [];

// Проверка
if (serverData) {
  students = serverData
}

// Функция создает новую строку студента в таблице
async function renderStudentTable(filteredStudentsArr) {
  const tableBody = document.getElementById('studentTableBody');
  tableBody.innerHTML = '';
  filteredStudentsArr.forEach(student => {
    const row = document.createElement('tr');
    const fullNameCell = document.createElement('td');
    fullNameCell.textContent = `${student.surname} ${student.name} ${student.lastname}`;
    row.appendChild(fullNameCell);

    const facultyCell = document.createElement('td');
    facultyCell.textContent = student.faculty;
    row.appendChild(facultyCell);

    const birthdayCell = document.createElement('td');
    student.birthday = new Date(student.birthday);
    const birthday = student.birthday.toLocaleDateString();
    const age = calculateAge(student.birthday);
    birthdayCell.textContent = `${birthday} (${age} лет)`;

    row.appendChild(birthdayCell);

    const studyYearsCell = document.createElement('td');
    const endYear = Number(student.studyStart) + 4;
    const currentYear = new Date().getFullYear();
    const studyYears = `${student.studyStart}-${endYear}`;
    const courseOrGraduated = endYear < currentYear ? 'закончил' : calculateCourse(student.studyStart, currentYear)
    studyYearsCell.textContent = `${studyYears} (${courseOrGraduated})`;
    row.appendChild(studyYearsCell);

    const delleteCell = document.createElement('td');
    const btDelete = document.createElement('button');
    btDelete.classList.add('btn', 'btn-danger', 'w-100');
    btDelete.textContent = 'Удалить';

    // Добавляем обработчик событий для удаление студента из таблицы и сервера
    btDelete.addEventListener('click', async () => {

      await deleteStudentServer(student.id);

      row.remove();
    });

    delleteCell.append(btDelete);
    row.appendChild(delleteCell);

    tableBody.appendChild(row);

  })

}

// Дополнительная функция высчитывает возраст студента
function calculateAge(birthday) {
  const today = new Date();
  const resultAge = today.getFullYear() - birthday.getFullYear();
  return resultAge
}

// Дополнительная функция высчитывает на каком курсе
function calculateCourse(studyStart, currentYear) {
  return currentYear - studyStart + 1;
}

// Выводим форму из HTML для дальнейшей работы с ней
const addStudentForm = document.getElementById('add-form');

// Добавляем обработчик событий форме для добавление студента
addStudentForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const surname = document.getElementById('surname').value.trim();
  const name = document.getElementById('name').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const birthday = new Date(document.getElementById('birthday').value);
  const studyStart = parseInt(document.getElementById('studyStart').value);
  const faculty = document.getElementById('faculty').value.trim();

  const errors = validateStudentData(surname, name, lastname, birthday, studyStart, faculty)

  if (errors) {
    const newStudent = {
      surname,
      name,
      lastname,
      birthday,
      studyStart,
      faculty,
    };

    const serverDataStudent = await addStudentServer(newStudent);
    serverDataStudent.birthday = new Date(serverDataStudent.birthday);
    students.push(serverDataStudent);

    renderStudentTable(students);
    addStudentForm.reset();
  }
});

// Функция для удаления стиля ошибки и текста сообщения об ошибке
function removeError(inputElement) {
  const parent = inputElement.parentNode;
  parent.classList.remove('error');
  parent.querySelector('.span-error')?.remove(); // Удаляем элемент span с сообщением об ошибке, если он существует
}

// Функция валидации полей ввода
function validateStudentData(surname, name, lastname, birthday, studyStart, faculty) {

  let result = true;

  const surnameValid = document.getElementById('surname');
  const nameValid = document.getElementById('name');
  const lastnameValid = document.getElementById('lastname');
  const birthdayValid = document.getElementById('birthday');
  const studyStartValid = document.getElementById('studyStart');
  const facultyValid = document.getElementById('faculty');

  function createError(input, text) {
    const parent = input.parentNode;
    parent.classList.add('error');
    const descError = document.createElement('span');
    descError.classList.add('span-error');
    descError.textContent = text;

    parent.appendChild(descError);

  }

  if (surname) {
    removeError(surnameValid);
  } else {
    createError(surnameValid, 'Введите фамилию')
    result = false;
  }

  if (name) {
    removeError(nameValid);
  } else {
    createError(nameValid, 'Введите имя');
    result = false;
  }

  if (lastname) {
    removeError(lastnameValid);
  } else {
    createError(lastnameValid, 'Введите отчество');
    result = false;
  }

  const today = new Date();
  const minDate = new Date('1900-01-01');
  if (birthday < today || birthday > minDate) {
    removeError(birthdayValid);
  } else {
    createError(birthdayValid, 'Некорректная дата рождения');
    result = false;
  }

  const currentYear = today.getFullYear();
  if (studyStart || studyStart < 2000 || studyStart > currentYear) {
    removeError(studyStartValid);
  } else {
    createError(studyStartValid, 'Некорректная дата поступления');
    result = false;
  }

  if (faculty) {
    removeError(facultyValid);
  } else {
    createError(facultyValid, 'Введите название факультета');
    result = false;
  }

  return result;

}

// Функция для фильтрации
function filteredStudentsForm() {

  const nameFilter = document.getElementById('filterName').value.trim().toLowerCase();
  const facultyFilter = document.getElementById('filterFaculty').value.trim().toLowerCase();
  const studyStartFilter = document.getElementById('filterstudyStart').value;
  console.log(studyStartFilter)
  const endYearFilter = document.getElementById('filterEndYear').value;

  const filteredStudentsArr = students.filter(student => {
    const fullName = `${student.surname.toLowerCase()} ${student.name.toLowerCase()} ${student.lastname.toLowerCase()}`;
    const facultyName = student.faculty.toLowerCase();

    const nameMatch = fullName.includes(nameFilter);
    const facultyMatch = facultyName.includes(facultyFilter);
    const studyStartMatch = !studyStartFilter || Number(student.studyStart) === parseInt(studyStartFilter);
    console.log(studyStartMatch)
    const endYearMatch = !endYearFilter || (Number(student.studyStart) + 4) === parseInt(endYearFilter);

    return nameMatch && facultyMatch && studyStartMatch && endYearMatch;
  });

  renderStudentTable(filteredStudentsArr);
}

// Функция для сортировки
function sortStudent(arr, prop, dir = false) {
  return arr.sort((a, b) => {
    if (prop === 'fullName') {
      const fullNameA = `${a.surname} ${a.name} ${a.lastname}`.trim().toLowerCase();
      const fullNameB = `${b.surname} ${b.name} ${b.lastname}`.trim().toLowerCase();
      if (dir) {
        return fullNameA.localeCompare(fullNameB);
      } else {
        return fullNameB.localeCompare(fullNameA);
      }
    }
    if (dir) {
      if (a[prop] > b[prop]) return 1;
      if (a[prop] < b[prop]) return -1;
    } else {
      if (a[prop] > b[prop]) return -1;
      if (a[prop] < b[prop]) return 1;
    }

  })
}

// Отоброжаем таблицу со студентами
renderStudentTable(students);

// Добавляем глобальную переменную для хранения направления сортировки
let sortDirection = {};

function sortColumn(column) {
  sortStudent(students, column, sortDirection[column] || false); // Используем значение из объекта sortDirection или false по умолчанию
  renderStudentTable(students); // Рендерим таблицу после сортировки
  sortDirection[column] = !sortDirection[column]; // Переключаем направление сортировки
}

//Обработчик событий для фильтрации
const filterInputs = document.querySelectorAll('#filterName, #filterFaculty, #filterstudyStart, #filterEndYear');
filterInputs.forEach(input => {
  input.addEventListener('input', filteredStudentsForm);
});

// Обработчик событий для сортировки
const tableHeaders = document.querySelectorAll('th');
tableHeaders.forEach((header, index) => {
  header.addEventListener('click', () => {
    const columns = ['fullName', 'faculty', 'birthday', 'studyStart'];
    sortColumn(columns[index]);
  });
});
