import { isAfter } from 'date-fns';
import { Op } from 'sequelize';
import Register from '../models/Register';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import ConfirmationMail from '../jobs/ConfirmationMail';

class RegisterController {
  async store(req, res) {
    const checkIfAlreadyRegistered = await Register.findOne({
      where: {
        user_id: req.userId,
        meetup_id: req.body.meetupId,
        canceled_at: [{ [Op.not]: null }],
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
        canceled_at: [{ [Op.not]: null }],
      },
    });

    const meetupIds = userMeetups.map(id => id.meetup_id);

    const countMeetupsInDate = await Meetup.count({
      where: {
        id: {
          [Op.in]: meetupIds,
        },
        date: meetup.date,
      },
    });

    if (countMeetupsInDate > 0) {
      return res
        .status(400)
        .json({ error: "Can't register to a event at the same date of another one." });
    }

    const register = await Register.create({
      user_id: req.userId,
      meetup_id: req.body.meetupId,
    });

    const mailData = await Register.findOne({
      where: {
        user_id: req.userId,
        meetup_id: req.body.meetupId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['name'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['fullname', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['fullname', 'email'],
        },
      ],
    });

    await Queue.add(ConfirmationMail.key, {
      mailData,
    });

    return res.json(register);
  }

  async delete(req, res) {
    const { meetupId } = req.params;
    const { userId } = req;

    const meetup = await Register.findOne({
      where: {
        user_id: userId,
        meetup_id: meetupId,
        canceled_at: null,
      },
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Not found' });
    }

    meetup.canceled_at = new Date();

    await meetup.save();

    return res.json(meetup);
  }
}

export default new RegisterController();
