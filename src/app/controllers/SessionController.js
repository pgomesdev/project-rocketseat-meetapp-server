import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
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
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { id, fullname } = user;

    const token = jwt.sign({ id: user.id }, process.env.APP_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      user: {
        id,
        fullname,
        email,
      },
      token,
    });
  }
}

export default new SessionController();
