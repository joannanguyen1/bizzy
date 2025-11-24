-- Update existing users with NULL usernames to use email prefix
-- This creates a unique username from their email (part before @)
UPDATE "user"
SET "username" = LOWER(SPLIT_PART("email", '@', 1))
WHERE "username" IS NULL;
--> statement-breakpoint

-- Handle duplicate usernames by appending a random suffix
-- First, identify duplicates and update them with a unique suffix
DO $$
DECLARE
  r RECORD;
  new_username TEXT;
  counter INT;
BEGIN
  -- Loop through all duplicate usernames
  FOR r IN
    SELECT username, array_agg(id) as user_ids
    FROM "user"
    WHERE username IS NOT NULL
    GROUP BY username
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    -- Update all but the first user with the duplicate username
    FOREACH new_username IN ARRAY r.user_ids[2:array_length(r.user_ids, 1)]
    LOOP
      UPDATE "user"
      SET username = r.username || counter::TEXT
      WHERE id = new_username;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;
--> statement-breakpoint

-- Now safely add NOT NULL constraint
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;
