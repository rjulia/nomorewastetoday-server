const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { Users } = require("../data/db");

async function tradeTokenForUser(token) {
  return jwt.verify(token, process.env.SECRETO);
}

const authenticated = (next) => (root, args, context, info) => {
  if (!context.currentUser) {
    throw new Error(`Unauthenticated!`);
  }

  return next(root, args, context, info);
};

const validateRole = (rol) => (next) => async (root, args, context, info) => {
  const user = await Users.findOne({ user: context.currentUser.user });

  if (user.rol !== rol) {
    throw new Error(`You are not authorized!`);
  }

  return next(root, args, context, info);
};

module.exports = {
  tradeTokenForUser,
  authenticated,
  validateRole,
};
