const mongoose = require('mongoose');
const Schedule = require('./models/Schedule'); // Убедитесь, что путь к модели Schedule правильный

// Подключение к MongoDB
mongoose.connect('mongodb+srv://admin:admin@cluster0.yb3vt.mongodb.net/test');

// Список студентов
const students = [
  { _id: '68452d4e93db692e1c651012', name: 'Иван', surname: 'Смирнов', patronymic: 'Иванович' },
  { _id: '68452d4e93db692e1c651013', name: 'Алексей', surname: 'Ахатов', patronymic: 'Олегович' },
  { _id: '68452d4e93db692e1c651014', name: 'Мария', surname: 'Попова', patronymic: 'Петровна' },
  { _id: '68452d4e93db692e1c651015', name: 'Анна', surname: 'Васильева', patronymic: 'Сергеевна' },
  { _id: '68452d4e93db692e1c651016', name: 'Дмитрий', surname: 'Липман', patronymic: 'Андреевич' },
  { _id: '68452d4e93db692e1c651017', name: 'Елена', surname: 'Плеханова', patronymic: 'Владимировна' },
  { _id: '68452d4e93db692e1c651018', name: 'Сергей', surname: 'Лобовиков', patronymic: 'Николаевич' },
  { _id: '68452d4e93db692e1c651019', name: 'Ольга', surname: 'Цыркунова', patronymic: 'Михайловна' },
  { _id: '68452d4e93db692e1c65101a', name: 'Андрей', surname: 'Кирпичников', patronymic: 'Дмитриевич' },
  { _id: '68452d4e93db692e1c65101b', name: 'Наталья', surname: 'Галимнасова', patronymic: 'Александровна' },
  { _id: '68452d4e93db692e1c65101c', name: 'Владимир', surname: 'Федоров', patronymic: 'Евгеньевич' },
  { _id: '68452d4e93db692e1c65101d', name: 'Татьяна', surname: 'Курайская', patronymic: 'Юрьевна' },
  { _id: '68452d4e93db692e1c65101e', name: 'Михаил', surname: 'Волков', patronymic: 'Олегович' },
  { _id: '68452d4e93db692e1c65101f', name: 'Екатерина', surname: 'Винниченко', patronymic: 'Павеловна' },
  { _id: '68452d4e93db692e1c651020', name: 'Александр', surname: 'Лебедев', patronymic: 'Георгиевич' },
  { _id: '68452d4e93db692e1c651021', name: 'Юлия', surname: 'Колпашникова', patronymic: 'Викторовна' },
  { _id: '68452d4e93db692e1c651022', name: 'Павел', surname: 'Мельников', patronymic: 'Анатольевич' },
  { _id: '68452d4e93db692e1c651023', name: 'Анастасия', surname: 'Шедловская', patronymic: 'Вадимовна' },
  { _id: '68452d4e93db692e1c651024', name: 'Игорь', surname: 'Томберг', patronymic: 'Антонович' },
  { _id: '68452d4e93db692e1c651025', name: 'Ксения', surname: 'Павловна', patronymic: 'Станиславовна' },
  { _id: '68452d4e93db692e1c651026', name: 'Георгий', surname: 'Бывшенко', patronymic: 'Романович' },
  { _id: '68452d4e93db692e1c651027', name: 'Виктория', surname: 'Орлова', patronymic: 'Егоровна' },
  { _id: '68452d4e93db692e1c65102a', name: 'Евгений', surname: 'Пасечник', patronymic: 'Максимович' }
];

// Предметы
const subjects = ['Алгебра', 'Геометрия'];

// Описания занятий для каждого предмета
const subjectDescriptions = {
  'Алгебра': [
    'Тригонометрия',
    'Квадратные уравнения',
    'Уравнения и неравенства',
    'Элементы математического анализа',
    'Координаты на прямой и плоскости',
    'Вероятность и статистика',
    'Расчёты по формулам',
    'Задачи на прогрессии'
  ],
  'Геометрия': [
    'Площади фигур',
    'Объемные фигуры',
    'Признаки квадрата',
    'Признаки треугольника',
    'Признаки прямоугольника',
    'Признаки ромба'
  ]
};

// Временные слоты с шагом в один час
const timeSlots = [
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

// Функция для генерации случайного числа в диапазоне
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для генерации случайной даты в заданном диапазоне
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateSchedule() {
  const startDate = new Date('2025-04-28');
  const endDate = new Date('2025-06-02');
  const schedules = [];
  const busySlots = {};

  // Функция для проверки доступности временного слота
  function isTimeSlotAvailable(date, time) {
    const dateKey = date.toISOString().split('T')[0];
    if (!busySlots[dateKey]) {
      return true;
    }
    return !busySlots[dateKey].includes(time);
  }

  // Функция для добавления временного слота в занятые слоты
  function addBusySlot(date, time) {
    const dateKey = date.toISOString().split('T')[0];
    if (!busySlots[dateKey]) {
      busySlots[dateKey] = [];
    }
    busySlots[dateKey].push(time);
  }

  // Перемешиваем студентов для случайного распределения
  const shuffledStudents = [...students].sort(() => 0.5 - Math.random());

  // Функция для создания расписания для группы студентов
  function scheduleGroup(group, startDayOffset) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + startDayOffset);

    while (currentDate <= endDate) {
      // Перемешиваем студентов для случайного распределения в течение дня
      const dailyShuffledStudents = [...group].sort(() => 0.5 - Math.random());

      for (let i = 0; i < dailyShuffledStudents.length; i++) {
        const student = dailyShuffledStudents[i];
        const time = timeSlots[i % timeSlots.length];

        if (isTimeSlotAvailable(currentDate, time)) {
          const subject = subjects[getRandomInt(0, subjects.length - 1)];
          const description = subjectDescriptions[subject][getRandomInt(0, subjectDescriptions[subject].length - 1)];

          schedules.push({
            student_id: student._id,
            group_id: null,
            day: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][currentDate.getDay()],
            date: new Date(currentDate),
            time: time,
            duration: 60,
            subject: subject,
            description: description,
            attendance: true,
            grade: getRandomInt(1, 5)
          });

          addBusySlot(currentDate, time);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1); // Переход к следующему дню
    }
  }

  // Создаем расписание для всех студентов
  scheduleGroup(shuffledStudents, 0);

  try {
    await Schedule.insertMany(schedules);
    console.log('Schedule has been successfully created!');
  } catch (err) {
    console.error('Error creating schedule:', err);
  } finally {
    mongoose.connection.close();
  }
}

generateSchedule();
