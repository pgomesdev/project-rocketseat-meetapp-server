import Mail from '../../lib/Mail';

class ConfirmationMail {
  get key() {
    return 'ConfirmationMail';
  }

  async handle({ data }) {
    const { mailData } = data;

    await Mail.sendMail({
      to: `${mailData.meetup.user.fullname} <${mailData.meetup.user.email}>`,
      subject: 'Inscrição confirmada!',
      template: 'confirmation',
      context: {
        host: mailData.meetup.user.fullname,
        fullname: mailData.user.fullname,
        email: mailData.user.email,
        meetup: mailData.meetup.name,
      },
    });
  }
}

export default new ConfirmationMail();
