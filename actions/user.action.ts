"use server";

import User from "@/database/models/user.model";
import { connect } from "@/database/db";

export async function createUser(user: any) {
    try {
      await connect();
      const newUser = await User.create(user);
      console.log("newUser", newUser);
      
      return JSON.parse(JSON.stringify(newUser));
      
    } catch (error) {
      console.log(error);
    }
  
  };