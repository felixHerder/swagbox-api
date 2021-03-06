const { createSessions } = require('./signin');

const handleRegister = (req, res, db, bcrypt) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json('incorect form submision');
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      username: username
    })
      .into('login')
      .returning('username')
      .then(loginuser => {
        return trx('users')
          .returning('*')
          .insert({
            username: loginuser[0],
            name: loginuser[0],
            joined: new Date(),
            color: '#000000'
          })
      })
      .then(trx.commit)
      .catch(err => {
        console.log(err);
        trx.rollback(err);
      });
  })
    .then(user => {
      return createSessions(user[0])
    })
    .then(session => {
      return res.json(session)
    })
    .catch(err => res.status(400).json(err + ' unable to register'));
}

module.exports = {
  handleRegister: handleRegister
}