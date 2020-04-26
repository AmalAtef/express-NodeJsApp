require("dotenv").config();

const requiredEnvs = ["JWT_SECRET", "MONGO_URI"];
const missingEnvs = requiredEnvs.filter(envName => !process.env[envName]);
if (missingEnvs.length) {
  throw new Error(`Missing required envs ${missingEnvs}`);
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 3000,
  saltRounds: process.env.SALT_ROUNDS || 8
};
