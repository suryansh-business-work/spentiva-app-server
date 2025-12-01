import { connect } from 'mongoose';

export default function db(dbUrl: string) {
  connect(dbUrl)
    .then(() => {
      console.log('Database Connected');
    })
    .catch((error) => {
      console.log('Error while connecting to the database', error);
    });
}
