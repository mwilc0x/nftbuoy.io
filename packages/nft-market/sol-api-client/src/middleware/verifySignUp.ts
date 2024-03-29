import db from '../models';
const ROLES = db.ROLES;
const User = db.user;

export function checkDuplicateEmail(req, res, next) {
  if (!req || !req.body || !req.body.email) {
    res.status(400).send({
      message: 'Failed! No email provided!'
    });
    return;
  }

  // Email
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: 'Failed! Email is already in use!'
      });
      return;
    }

    next();
  });
};

export function checkRolesExisted(req, res, next) {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: 'Failed! Role does not exist = ' + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};
