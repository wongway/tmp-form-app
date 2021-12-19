export const ChannelSchema = {
  name: 'Channel',
  properties: {
    _id: 'objectId',
    channel_id: 'string',
    creator_id: 'User',
    description: 'string',
    name: 'string',
    realm_id: 'string',
  },
  primaryKey: '_id',
};

export const UserSchema = {
  name: 'User',
  properties: {
    _id: 'objectId',
    email: 'string',
    followed_channels: 'objectId[]',
    is_creator: 'bool',
    name: 'string',
    realm_id: 'string',
    user_id: 'string',
  },
  primaryKey: '_id',
};

export const WorkoutLogSchema = {
  name: 'WorkoutLog',
  properties: {
    _id: 'objectId',
    data: 'WorkoutData[]',
    realm_id: 'string',
    timestamp: 'date',
    user_id: 'User',
    workout_id: 'Workout',
  },
  primaryKey: '_id',
};

export const WorkoutDataSchema = {
  name: 'WorkoutData',
  embedded: true,
  properties: {
    avg: 'double?',
    confidence: 'double?',
    is_rep: 'bool?',
    n_stddev: 'double?',
    stddev: 'double?',
    timestamp: 'date?',
    x: 'double?',
    y: 'double?',
    zscore: 'double?',
  },
};

export const WorkoutSchema = {
  name: 'Workout',
  properties: {
    _id: 'objectId',
    channel_id: 'Channel',
    name: 'string',
    realm_id: 'string',
    sets: 'int',
    steps: 'WorkoutStep[]',
    workout_id: 'string',
  },
  primaryKey: '_id',
};

export const WorkoutStepSchema = {
  name: 'WorkoutStep',
  embedded: true,
  properties: {
    count: 'int',
    name: 'string',
    type: 'string',
  },
};

