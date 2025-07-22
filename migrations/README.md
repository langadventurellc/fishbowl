# Database Migrations

This directory is reserved for SQL migration files that will be created when implementing database features.

## Migration Structure

When ready to implement database features, migration files should follow this naming convention:

- `001_initial_schema.sql` - Initial database schema
- `002_add_feature_table.sql` - Additional feature migrations
- etc.

## Usage

Migrations will be run using the `pnpm db:migrate` command once database functionality is implemented.

## Platform Support

- **Desktop (Electron)**: Uses native SQLite integration
- **Mobile (React Native)**: Uses `expo-sqlite` with SQLite
- **Shared Interface**: Abstract database interface in `packages/shared/src/db/`
