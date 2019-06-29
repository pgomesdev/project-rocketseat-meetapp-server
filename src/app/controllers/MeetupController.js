import * as Yup from 'yup';
import { isAfter, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (!isAfter(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: "Can't create an event with a date that is already gone" });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: "You don't have permission to update this meetup" });
    }

    const {
      id, name, description, location, date,
    } = await meetup.update(req.body);

    return res.json({
      id,
      name,
      description,
      location,
      date,
    });
  }
}

export default new MeetupController();
