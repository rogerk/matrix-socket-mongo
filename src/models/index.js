import mongoose from "mongoose";
import Matrix from "./Matrix";

const connectDb = () => {
    return mongoose.connect(process.env.DATABASE_URL);
};

const models = { Matrix };

export { connectDb };
export default models;
