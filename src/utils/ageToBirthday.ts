import moment from 'moment';

const ageToBirthday = (age: number): string => {
  const birthday = moment()
    .subtract(age, 'years')
    .format('YYYY-MM-DD');
  return birthday;
};

export default ageToBirthday;
