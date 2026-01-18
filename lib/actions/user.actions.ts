'use server'

import {connectToDatabase} from "@/Database/mongoose";
import mongoose from "mongoose";

export const getAllUserForNewsEmail = async () => {
    try {
        const response = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database not connected");
        }

        const users = await db.collection("user").find({
                email: {$exists: true, $ne: null},

            },
            {projection: {_id: 1, id: 1, email: 1, name: 1, country: 1}}).toArray();

        return users.filter(user => user.email && user.name).map(user => {
            return {
                id: user.id || user._id.toString() || '',
                email: user.email,
                name: user.name,
            }
        })
    } catch (err) {
        console.error('Error fetching user', err)
    }
}