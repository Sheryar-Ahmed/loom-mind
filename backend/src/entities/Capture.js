const { EntitySchema } = require('typeorm');

/**
 * Capture Entity
 * Stores all types of captured content (URL, text, image, file, note)
 */
const Capture = new EntitySchema({
  name: 'Capture',
  tableName: 'captures',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    type: {
      type: 'enum',
      enum: ['url', 'text', 'image', 'file', 'note'],
      nullable: false,
    },
    title: {
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    url: {
      type: 'text',
      nullable: true,
    },
    domain: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    text: {
      type: 'text',
      nullable: true,
    },
    rawText: {
      type: 'text',
      nullable: true,
    },
    ocrText: {
      type: 'text',
      nullable: true,
    },
    imageUrl: {
      type: 'text',
      nullable: true,
    },
    thumbnailUrl: {
      type: 'text',
      nullable: true,
    },
    favicon: {
      type: 'text',
      nullable: true,
    },
    summary: {
      type: 'text',
      nullable: true,
    },
    language: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    author: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    publishedDate: {
      type: 'timestamp',
      nullable: true,
    },
    processingStatus: {
      type: 'enum',
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    device: {
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    source: {
      type: 'varchar',
      length: 100,
      nullable: true,
      default: 'web',
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
      default: {},
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
      name: 'IDX_CAPTURE_USER',
      columns: ['userId'],
    },
    {
      name: 'IDX_CAPTURE_TYPE',
      columns: ['type'],
    },
    {
      name: 'IDX_CAPTURE_CREATED',
      columns: ['createdAt'],
    },
    {
      name: 'IDX_CAPTURE_STATUS',
      columns: ['processingStatus'],
    },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
      },
      onDelete: 'CASCADE',
    },
    tags: {
      type: 'many-to-many',
      target: 'Tag',
      joinTable: {
        name: 'capture_tags',
        joinColumn: {
          name: 'captureId',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'tagId',
          referencedColumnName: 'id',
        },
      },
    },
    notes: {
      type: 'one-to-many',
      target: 'Note',
      inverseSide: 'capture',
      cascade: true,
    },
    collections: {
      type: 'many-to-many',
      target: 'Collection',
      inverseSide: 'captures',
    },
  },
});

module.exports = { Capture };
