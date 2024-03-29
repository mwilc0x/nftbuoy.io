import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models';
const User = db.user;
const Role = db.role;

export function signup(req, res) {
  const saltRounds = 10
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      throw err;
    } else {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        if (err) {
          throw err;
        } else {
          User.create({
            email: req.body.email,
            password: hash
          })
          .then(user => {
            if (req.body.roles) {
              Role.findAll({
                where: {
                  name: {
                    [Op.or]: req.body.roles
                  }
                }
              }).then(roles => {
                user.setRoles(roles).then(() => {
                  res.send({ message: 'User registered successfully!' });
                });
              });
            } else {
              // user role = 1
              user.setRoles([1]).then(() => {
                res.send({ message: 'User registered successfully!' });
              });
            }
          })
          .catch(err => {
            res.status(500).send({ message: err.message });
          });
        }
      })
    }
  });
};

export function signin(req, res) {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!'
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: 3600 // 1 hour
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push('ROLE_' + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
