import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const MONGODB_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@clusters.secnb7z.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(MONGODB_URI, {
    // userNewUrlParser: true,
    // userUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connection to MongoDB", error.message);
  });
