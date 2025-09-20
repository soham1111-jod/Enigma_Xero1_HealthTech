import mongoose from "mongoose";
import { DB_Name } from "../const.js";
 
const connectDB = async () => {
  try {
    const connectionResponse = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_Name}`
    );
    console.log("Database is connected",connectionResponse.connection.host);
  } catch (error) {
    console.log("Error:", error);
    process.exit(1);
  }
};
export default connectDB;