const { EntitySchema } = require('typeorm');

/**
 * Collection Entity
 * Organized groups of captures
 */
const Collection = new EntitySchema({
  name: 'Collection',
  tableName: 'collections',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    isPublic: {
      type: 'boolean',
      default: false,
    },
    userId: {
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
      name: 'IDX_COLLECTION_USER',
      columns: ['userId'],
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
    captures: {
      type: 'many-to-many',
      target: 'Capture',
      joinTable: {
        name: 'collection_captures',
        joinColumn: {
          name: 'collectionId',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'captureId',
          referencedColumnName: 'id',
        },
      },
    },
  },
});

module.exports = { Collection };
