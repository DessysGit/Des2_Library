/**
 * Initial migration to create users, books, likes, and reviews tables.
 * Uses check constraints or creates table if not exists for backwards compatibility.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create users table
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.text('username').unique().notNullable();
      table.text('email').unique().notNullable();
      table.text('password').notNullable();
      table.text('role').notNullable().defaultTo('user');
      table.text('profilePicture').defaultTo('');
      table.text('favoriteGenres').defaultTo('');
      table.text('favoriteAuthors').defaultTo('');
      table.text('favoriteBooks').defaultTo('');
      table.boolean('isEmailVerified').defaultTo(false);
      table.text('emailVerificationToken');
      table.timestamp('emailVerificationExpires');
      table.text('passwordResetToken');
      table.timestamp('passwordResetExpires');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }

  // Create books table
  const hasBooks = await knex.schema.hasTable('books');
  if (!hasBooks) {
    await knex.schema.createTable('books', (table) => {
      table.increments('id').primary();
      table.text('title');
      table.text('author');
      table.text('description');
      table.text('genres');
      table.text('cover');
      table.text('file');
      table.integer('likes').defaultTo(0);
      table.integer('dislikes').defaultTo(0);
      table.text('summary');
      table.float('averagerating').defaultTo(0);
    });
  }

  // Create likes table
  const hasLikes = await knex.schema.hasTable('likes');
  if (!hasLikes) {
    await knex.schema.createTable('likes', (table) => {
      table.increments('id').primary();
      table.integer('userId');
      table.integer('bookId');
      table.text('action');
      table.unique(['userId', 'bookId']);
    });
  }

  // Create reviews table
  const hasReviews = await knex.schema.hasTable('reviews');
  if (!hasReviews) {
    await knex.schema.createTable('reviews', (table) => {
      table.increments('id').primary();
      table.integer('bookId');
      table.integer('userId');
      table.text('username');
      table.text('text');
      table.integer('rating');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('likes');
  await knex.schema.dropTableIfExists('books');
  await knex.schema.dropTableIfExists('users');
};
