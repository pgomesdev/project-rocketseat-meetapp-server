import { isAfter } from 'date-fns';
import { Op } from 'sequelize';
import Register from '../models/Register';
import Meetup from '../models/Meetup';

class RegisterController {
  async store(req, res) {
    const checkIfAlreadyRegistered = await Register.findOne({
      where: {
        user_id: req.userId,
        meetup_id: req.body.meetupId,
      },
    });

    if (checkIfAlreadyRegistered) {
      return res.status(401).json({ error: 'You already registered to this event' });
    }

    const meetup = await Meetup.findByPk(req.body.meetupId);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res.status(401).json({ error: "Can't register to a event hosted by yourself." });
    }

    if (!isAfter(meetup.date, new Date())) {
      return res.status(400).json({ error: "Can't register to a past event." });
    }

    const userMeetups = await Register.findAll({
      where: {
        user_id: req.userId,
      },
    });

    const meetupIds = userMeetups.map(id => id.meetup_id);

    console.log(meetupIds);

    const countMeetupsInDate = await Meetup.count({
      where: {
        id: {
          [Op.in]: meetupIds,
        },
        date: meetup.date,
      },
    });

    console.log(countMeetupsInDate);

    if (countMeetupsInDate > 0) {
      return res
        .status(400)
        .json({ error: "Can't register to a event at the same date of another one." });
    }

    const register = await Register.create({
      user_id: req.userId,
      meetup_id: req.body.meetupId,
    });

    return res.json(register);
  }
}

export default new RegisterController();
