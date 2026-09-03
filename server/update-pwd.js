const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

bcrypt.hash('Physics@10', 10).then(hash => {
  MongoClient.connect('mongodb://127.0.0.1:27017').then(client => {
    const db = client.db('jansewa');
    db.collection('users').updateOne(
      { email: 'anamikacrew8@gmail.com' },
      { $set: { password: hash } }
    ).then(res => {
      console.log('Updated:', res.modifiedCount);
      client.close();
    });
  });
});
