import Sequelize from 'sequelize';
import dbConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Register from '../app/models/Register';

const models = [User, File, Meetup, Register];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models
      .map(model => model.init(this.connection))
      .forEach(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
