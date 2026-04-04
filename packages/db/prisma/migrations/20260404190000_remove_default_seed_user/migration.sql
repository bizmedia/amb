-- No default dashboard user: accounts are created via signup only.
DELETE FROM "User" WHERE "email" = 'admin@local.test';
