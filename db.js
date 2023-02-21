import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const MONGODB_URI = `mongodb+srv://kevinCluster:kevinCluster@clusters.secnb7z.mongodb.net/?retryWrites=true&w=majority`;

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
