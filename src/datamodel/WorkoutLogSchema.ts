// import BSON from 'BSON';
import { BSON } from 'realm';

export type user = {
  _id?: BSON.ObjectId;
  email?: string;
  followed_channels: Array<BSON.ObjectId>;
  is_creator?: boolean;
  name?: string;
  realm_id?: string;
  user_id?: string;
};

export const userSchema = {
  name: 'user',
  properties: {
    _id: 'objectId?',
    email: 'string?',
    followed_channels: 'objectId[]',
    is_creator: 'bool?',
    name: 'string?',
    realm_id: 'string?',
    user_id: 'string?',
  },
  primaryKey: '_id',
};

export type workoutlog = {
    _id: BSON.ObjectId;
    end_time?: Date;
    realm_id: string;
    start_time?: Date;
    steps: Array<workoutstep>;
    user_id: BSON.ObjectId;
    workout_id: BSON.ObjectId;
};
  
export const workoutlogSchema = {
    name: 'workoutlog',
    properties: {
      _id: 'objectId',
      end_time: 'date?',
      realm_id: 'string',
      start_time: 'date?',
      steps: 'workoutstep[]',
      user_id: 'objectId',
      workout_id: 'objectId',
    },
    primaryKey: '_id',
};

export type workoutstep = {
  count?: number;
  duration?: number;
  index?: number;
  name?: string;
  timestamp?: Date;
  type?: string;
};

export const workoutstepSchema = {
  name: 'workoutstep',
  embedded: true,
  properties: {
    count: 'int?',
    duration: 'int?',
    index: 'int?',
    name: 'string?',
    timestamp: 'date?',
    type: 'string?',
  },
};

