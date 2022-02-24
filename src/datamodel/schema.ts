import { BSON as bson } from 'realm';

export type Channel = {
  _id?: bson.ObjectId;
  creator_id?: bson.ObjectId;
  description?: string;
  image_url?: string;
  name?: string;
  realm_id: string;
};

export const ChannelSchema = {
  name: 'Channel',
  properties: {
    _id: 'objectId?',
    creator_id: 'objectId?',
    description: 'string?',
    image_url: 'string?',
    name: 'string?',
    realm_id: 'string',
  },
  primaryKey: '_id',
};

export type User = {
  _id?: bson.ObjectId;
  email?: string;
  followed_channels: Array<bson.ObjectId>;
  image_url?: string;
  is_creator?: boolean;
  name?: string;
  realm_id: string;
  user_id?: string;
};

export const UserSchema = {
  name: 'User',
  properties: {
    _id: 'objectId?',
    email: 'string?',
    followed_channels: 'objectId[]',
    image_url: 'string?',
    is_creator: 'bool?',
    name: 'string?',
    realm_id: 'string',
    user_id: 'string?',
  },
  primaryKey: '_id',
};

export type WorkoutLog = {
  _id: bson.ObjectId;
  data: Array<WorkoutData>;
  end_time?: Date;
  realm_id: string;
  start_time?: Date;
  steps: Array<WorkoutLogStep>;
  user_id: bson.ObjectId;
  workout_id: bson.ObjectId;
};

export const WorkoutLogSchema = {
  name: 'WorkoutLog',
  properties: {
    _id: 'objectId',
    data: 'WorkoutData[]',
    end_time: 'date?',
    realm_id: 'string',
    start_time: 'date?',
    steps: 'WorkoutLogStep[]',
    user_id: 'objectId',
    workout_id: 'objectId',
  },
  primaryKey: '_id',
};

export type WorkoutData = {
  pose_data: Array<PoseEstimationData>;
  rep_data?: RepCountData;
  timestamp?: Date;
};

export const WorkoutDataSchema = {
  name: 'WorkoutData',
  embedded: true,
  properties: {
    pose_data: 'PoseEstimationData[]',
    rep_data: 'RepCountData',
    timestamp: 'date?',
  },
};

export type PoseEstimationData = {
  algorithm: string;
  confidence: number;
  keypoint: string;
  x: number;
  y: number;
};

export const PoseEstimationDataSchema = {
  name: 'PoseEstimationData',
  embedded: true,
  properties: {
    algorithm: 'string',
    confidence: 'double',
    keypoint: 'string',
    x: 'double',
    y: 'double',
  },
};

export type RepCountData = {
  algorithm: string;
  avg?: number;
  height?: number;
  is_rep: boolean;
  n_stddev?: number;
  status?: number;
  stddev?: number;
  zscore?: number;
};

export const RepCountDataSchema = {
  name: 'RepCountData',
  embedded: true,
  properties: {
    algorithm: 'string',
    avg: 'double?',
    height: 'double?',
    is_rep: 'bool',
    n_stddev: 'double?',
    status: 'int?',
    stddev: 'double?',
    zscore: 'double?',
  },
};

export type WorkoutLogStep = {
  count?: number;
  duration?: number;
  index?: number;
  name?: string;
  timestamp?: Date;
  type?: string;
};

export const WorkoutLogStepSchema = {
  name: 'WorkoutLogStep',
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

export type Workout = {
  _id?: bson.ObjectId;
  channel_id?: bson.ObjectId;
  description?: string;
  image_url?: string;
  name?: string;
  realm_id: string;
  sets?: number;
  steps: Array<WorkoutStep>;
  tags: Array<string>;
};

export const WorkoutSchema = {
  name: 'Workout',
  properties: {
    _id: 'objectId?',
    channel_id: 'objectId?',
    description: 'string?',
    image_url: 'string?',
    name: 'string?',
    realm_id: 'string',
    sets: 'int?',
    steps: 'WorkoutStep[]',
    tags: 'string[]',
  },
  primaryKey: '_id',
};

export type WorkoutStep = {
  count?: number;
  duration?: number;
  index?: number;
  name?: string;
  timestamp?: Date;
  type?: string;
};

export const WorkoutStepSchema = {
  name: 'WorkoutStep',
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