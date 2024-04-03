import app from "./app.js";
import connectDB from "./db/index.js";       
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

(async () => {
    try {
        await connectDB();
        
        app.on("error", (error) => {
            console.log(`Connection failed: ${error}`);
            throw error;
        });

        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 5000}`);
        });
    } catch (error) {
        console.log("Database Connection failed!!!", error);
    }
})();
