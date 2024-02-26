const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(bodyParser.json());

let tasks = [
  { id: 1, title: 'Task 1', completed: false },
  { id: 2, title: 'Task 2', completed: true },
  { id: 3, title: 'Task 3', completed: false }
];

app.get('/tasks', (req, res) => {
  let filteredTasks = tasks;

  if (req.query.completed) {
    filteredTasks = filteredTasks.filter(task => task.completed === (req.query.completed === 'true'));
  }

  if (req.query.sortBy === 'title') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = filteredTasks.length;

  filteredTasks = filteredTasks.slice(startIndex, endIndex);

  res.json({
    tasks: filteredTasks,
    page,
    limit,
    total
  });
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    res.json(task);
  }
});

app.post('/tasks', (req, res) => {
  const { title, completed } = req.body;
  const newTask = { id: tasks.length + 1, title, completed };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed } = req.body;
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    const updatedTask = { id: taskId, title, completed };
    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  }
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.json(deletedTask);
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


const fs = require('fs');

const swaggerData = {
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Task API',
    description: 'API для управления задачами',
  },
  basePath: '/',
  paths: {
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Получение списка задач',
        description: 'Позволяет получить список всех задач с возможностью фильтрации, сортировки и пагинации',
        parameters: [
          {
            name: 'completed',
            in: 'query',
            description: 'Фильтр по статусу выполнения задачи',
            required: false,
            type: 'boolean',
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Сортировка по названию задачи',
            required: false,
            type: 'string',
            enum: ['title'],
          },
          {
            name: 'page',
            in: 'query',
            description: 'Номер страницы',
            required: false,
            type: 'integer',
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Количество задач на странице',
            required: false,
            type: 'integer',
          },
        ],
        responses: {
          200: {
            description: 'Успешный запрос',
            schema: {
              type: 'object',
              properties: {
                tasks: {
                  type: 'array',
                  items: {
                    $ref: '#/definitions/Task',
                  },
                },
                page: {
                  type: 'integer',
                },
                limit: {
                  type: 'integer',
                },
                total: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Добавление новой задачи',
        description: 'Позволяет добавить новую задачу',
        parameters: [
          {
            name: 'task',
            in: 'body',
            description: 'Объект задачи',
            required: true,
            schema: {
              $ref: '#/definitions/TaskInput',
            },
          },
        ],
        responses: {
          201: {
            description: 'Успешное создание задачи',
            schema: {
              $ref: '#/definitions/Task',
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Получение информации о задаче',
        description: 'Позволяет получить информацию о задаче по ее идентификатору',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Идентификатор задачи',
            required: true,
            type: 'integer',
          },
        ],
        responses: {
          200: {
            description: 'Успешный запрос',
            schema: {
              $ref: '#/definitions/Task',
            },
          },
          404: {
            description: 'Задача не найдена',
          },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Обновление информации о задаче',
        description: 'Позволяет обновить информацию о задаче по ее идентификатору',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Идентификатор задачи',
            required: true,
            type: 'integer',
          },
          {
            name: 'task',
            in: 'body',
            description: 'Объект задачи',
            required: true,
            schema: {
              $ref: '#/definitions/TaskInput',
            },
          },
        ],
        responses: {
        },
      },
    },
  },
  definitions: {
  },
};

const swaggerJson = JSON.stringify(swaggerData, null, 2);

fs.writeFileSync('swagger.json', swaggerJson);