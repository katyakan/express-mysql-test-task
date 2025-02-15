// src/database.ts
import { Sequelize } from 'sequelize';


// MySQL connection setup
const sequelize = new Sequelize('express_db', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // Optional: disables query logging
});
sequelize.sync({ force: false }) // sync() создаст таблицы, если они не существуют
  .then(() => {
    console.log("Таблицы синхронизированы");
  })
  .catch((err) => {
    console.error("Ошибка синхронизации:", err);
  });
sequelize.authenticate()
  .then(() => console.log("Connected to MySQL"))
  .catch(err => console.error("Unable to connect to the database:", err));

export { sequelize};
