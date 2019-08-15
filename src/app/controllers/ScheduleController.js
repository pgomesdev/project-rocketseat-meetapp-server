import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class ScheduleController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
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
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(meetup);
  }
}

export default new ScheduleController();
