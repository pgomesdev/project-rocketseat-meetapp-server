import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      fullname: Yup.string().required(),
      username: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create(req.body);

    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      fullname: Yup.string(),
      username: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string()
        .min(6)
        .when('password', (password, field) => (password ? field.required() : field)),
      password: Yup.string().min(6),
      confirmPassword: Yup.string()
        .min(6)
        .when('password', (password, field) => (password ? field.required().oneOf([Yup.ref('password')]) : field)),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email && (await User.findOne({ where: { email } }))) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (oldPassword && !(await user.validatePassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, fullname, username } = await user.update(req.body);

    return res.json({
      id,
      fullname,
      username,
      email: user.email,
    });
  }
}

export default new UserController();
