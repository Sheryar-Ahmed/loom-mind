const { EntitySchema } = require('typeorm');

/**
 * Note Entity
 * User notes attached to captures
 */
const Note = new EntitySchema({
  name: 'Note',
  tableName: 'notes',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    text: {
      type: 'text',
      nullable: false,
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    captureId: {
      type: 'uuid',
      nullable: false,
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
      name: 'IDX_NOTE_USER',
      columns: ['userId'],
    },
    {
      name: 'IDX_NOTE_CAPTURE',
      columns: ['captureId'],
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
    capture: {
      type: 'many-to-one',
      target: 'Capture',
      joinColumn: {
        name: 'captureId',
      },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = { Note };
