const { EntitySchema } = require('typeorm');

/**
 * Tag Entity
 * User-defined tags for organizing captures
 */
const Tag = new EntitySchema({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    color: {
      type: 'varchar',
      length: 7,
      nullable: true,
      default: '#6366f1',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  indices: [
    {
      name: 'IDX_TAG_USER',
      columns: ['userId'],
    },
    {
      name: 'IDX_TAG_USER_NAME',
      columns: ['userId', 'name'],
      unique: true,
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
      inverseSide: 'tags',
    },
  },
});

module.exports = { Tag };
