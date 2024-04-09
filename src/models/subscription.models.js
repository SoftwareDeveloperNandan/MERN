import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,   //One Whome is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},
    {timeseries: true}
)
export const Subscrition = mongoose.model("Subscription", subscriptionSchema)