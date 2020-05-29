require("dotenv").config();

const requiredEnvs = [
  "JWT_SECRET",
  "MONGO_URI",
  "CLOUD_NAME",
  "API_KEY",
  "API_SECRET"
];
const missingEnvs = requiredEnvs.filter(envName => !process.env[envName]);
if (missingEnvs.length) {
  throw new Error(`Missing required envs ${missingEnvs}`);
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  mongoURI: process.env.MONGO_URI,
  port: process.env.PORT || 3000,
  saltRounds: process.env.SALT_ROUNDS || 8,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET
};
