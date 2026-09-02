# Backend

## Production Database Setup

1. Create a PostgreSQL database on Render.
2. Get the Render connection details (host, port, user, password, database name).
3. Run `backend/schema.sql` against your production PostgreSQL database.
4. Set the `DATABASE_URL` or individual database environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) in your Render environment variables.
5. Start the backend.
