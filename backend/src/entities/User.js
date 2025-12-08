const { EntitySchema } = require('typeorm');

/**
 * User Entity
 * Stores user account information and authentication details
 */
const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
      select: false, // Don't include password in queries by default
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    plan: {
      type: 'enum',
      enum: ['free', 'pro', 'power'],
      default: 'free',
    },
    settings: {
      type: 'jsonb',
      nullable: true,
      default: {},
    },
    captureCount: {
      type: 'int',
      default: 0,
    },
    refreshToken: {
      type: 'varchar',
      length: 500,
      nullable: true,
      select: false,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  indices: [
    {
      name: 'IDX_USER_EMAIL',
      columns: ['email'],
    },
  ],
  relations: {
    captures: {
      type: 'one-to-many',
      target: 'Capture',
      inverseSide: 'user',
      cascade: true,
    },
    tags: {
      type: 'one-to-many',
      target: 'Tag',
      inverseSide: 'user',
      cascade: true,
    },
    notes: {
      type: 'one-to-many',
      target: 'Note',
      inverseSide: 'user',
      cascade: true,
    },
    collections: {
      type: 'one-to-many',
      target: 'Collection',
      inverseSide: 'user',
      cascade: true,
    },
  },
});

module.exports = { User };
