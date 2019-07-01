import { Op } from 'sequelize';
import Register from '../models/Register';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class AttendController {
  async index(req, res) {
    const meetup = await Register.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          order: ['date'],
          attributes: ['id', 'name', 'description', 'location', 'date'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['fullname', 'username', 'email'],
            },
            {
              model: File,
              as: 'banner',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(meetup);
  }
}

export default new AttendController();
