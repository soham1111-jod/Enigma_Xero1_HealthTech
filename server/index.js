import dotenv from "dotenv";
import connectDB from "./database/db.data.js";
import app from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`The Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("The Connection failed :(", error);
  });