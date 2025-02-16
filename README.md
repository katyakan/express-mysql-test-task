
# Test Task

## Описание

Этот проект представляет собой серверное приложение на **Express** с базой данных **MySQL**, используя **Sequelize** для ORM.
## Установка :interrobang::

Клонирование репозитория :floppy_disk::

    git clone https://github.com/katyakan/express-mysql-test-task.git

Перейдите в директорию проекта :arrow_heading_down::
 
       cd express-mysql-test-task

 Установите зависимости :arrow_heading_down::

    npm install
 Запустите миграции базы данных :arrow_heading_down::

    npx sequelize-cli db:migrate


Запустите приложение в режиме разработки :arrow_heading_down::

    npm run dev


## Скрипты :bookmark_tabs:


`npm run lint` - проверка кода с помощью ESLint

`npm run build` - компиляция TypeScript в JavaScript

`npm run dev` - запуск сервера в режиме разработки

`npm run start -` запуск сервера


