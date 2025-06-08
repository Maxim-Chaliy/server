const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Подключение к MongoDB
mongoose.connect('mongodb+srv://admin:admin@cluster0.yb3vt.mongodb.net/test');

// Определение схемы пользователя
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    maxlength: [50, 'Surname cannot exceed 50 characters']
  },
  patronymic: {
    type: String,
    trim: true,
    maxlength: [50, 'Patronymic cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'student'],
    default: 'student'
  },
  confirmationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const russianFirstNames = [
  'Иван', 'Алексей', 'Мария', 'Анна', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья',
  'Владимир', 'Татьяна', 'Михаил', 'Екатерина', 'Александр', 'Юлия', 'Павел', 'Анастасия', 'Игорь', 'Ксения',
  'Георгий', 'Виктория', 'Артём', 'Дарья', 'Евгений', 'Алина', 'Максим', 'Полина', 'Алексей', 'Виктор'
];

const russianLastNames = [
  'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Иванов', 'Петров', 'Сидоров', 'Михайлов', 'Новиков',
  'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов',
  'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьев', 'Борисов', 'Яковлев'
];

const russianMiddleNames = [
  'Иванович', 'Алексеевич', 'Петрович', 'Сергеевич', 'Андреевич', 'Владимирович', 'Николаевич', 'Михайлович', 'Дмитриевич', 'Александрович',
  'Евгеньевич', 'Юрьевич', 'Олегович', 'Павелович', 'Георгиевич', 'Викторович', 'Анатольевич', 'Вадимович', 'Антонович', 'Станиславович',
  'Романович', 'Егорович', 'Игоревич', 'Кириллович', 'Максимович', 'Тимофеевич', 'Артемович', 'Денисович', 'Григорьевич', 'Валериевич'
];

const domains = ['yandex.ru', 'gmail.com', 'mail.ru'];

async function generateUsers() {
  const users = [];

  // Функция транслитерации
  const transliterate = (str) => {
    const charMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return str.toLowerCase().split('').map(char => charMap[char] || char).join('').replace(/[^a-zA-Z0-9_]/g, '');
  };

  for (let i = 0; i < 30; i++) {
    const firstName = russianFirstNames[i % russianFirstNames.length];
    const lastName = russianLastNames[i % russianLastNames.length];
    const middleName = russianMiddleNames[i % russianMiddleNames.length];
    const domain = domains[Math.floor(Math.random() * domains.length)];

    const firstNameTranslit = transliterate(firstName);
    const lastNameTranslit = transliterate(lastName);

    const email = `${firstNameTranslit}.${lastNameTranslit}@${domain}`;
    const username = `${firstNameTranslit}_${lastNameTranslit}`;

    const password = await bcrypt.hash('password' + i, 10);

    users.push({
      name: firstName,
      surname: lastName,
      patronymic: middleName,
      email: email,
      username: username,
      password: password,
      role: 'student',
      isVerified: true
    });
  }

  try {
    await User.insertMany(users);
    console.log('Users have been successfully created!');
  } catch (err) {
    console.error('Error creating users:', err);
  } finally {
    mongoose.connection.close();
  }
}

generateUsers();
