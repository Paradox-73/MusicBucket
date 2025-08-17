
-- Create the new bucket_lists table
CREATE TABLE "public"."bucket_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."bucket_lists" OWNER TO "postgres";
ALTER TABLE "public"."bucket_lists" ADD CONSTRAINT "bucket_lists_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."bucket_lists" ADD CONSTRAINT "bucket_lists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add the bucket_list_id to the existing bucket_list_items table
ALTER TABLE "public"."bucket_list_items"
ADD COLUMN "bucket_list_id" "uuid";

-- For each user with existing items, create a default bucket list
INSERT INTO "public"."bucket_lists" ("user_id", "name")
SELECT "user_id", 'My Bucket List'
FROM "public"."bucket_list_items"
WHERE "user_id" IS NOT NULL
GROUP BY "user_id";

-- Update existing items to belong to the new default list
UPDATE "public"."bucket_list_items" "bli"
SET "bucket_list_id" = (
    SELECT "bl"."id"
    FROM "public"."bucket_lists" "bl"
    WHERE "bl"."user_id" = "bli"."user_id" AND "bl"."name" = 'My Bucket List'
    LIMIT 1
)
WHERE "bli"."bucket_list_id" IS NULL;

-- Make the new column non-nullable after populating it
ALTER TABLE "public"."bucket_list_items"
ALTER COLUMN "bucket_list_id" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "public"."bucket_list_items"
ADD CONSTRAINT "bucket_list_items_bucket_list_id_fkey"
FOREIGN KEY ("bucket_list_id") REFERENCES "public"."bucket_lists"("id") ON DELETE CASCADE;

-- Set up Row Level Security for the new table
ALTER TABLE "public"."bucket_lists" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for own lists"
ON "public"."bucket_lists"
FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable read access for public lists"
ON "public"."bucket_lists"
FOR SELECT USING (("is_public" = true));

CREATE POLICY "Enable insert for authenticated users"
ON "public"."bucket_lists"
FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable update for own lists"
ON "public"."bucket_lists"
FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable delete for own lists"
ON "public"."bucket_lists"
FOR DELETE USING (("auth"."uid"() = "user_id"));

-- Update RLS for bucket_list_items to check ownership through the bucket_lists table
-- First, drop the old policies
DROP POLICY IF EXISTS "Enable read access for own items" ON "public"."bucket_list_items";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."bucket_list_items";
DROP POLICY IF EXISTS "Enable delete for own items" ON "public"."bucket_list_items";

-- Then, create the new policies
CREATE POLICY "Enable read access for own items"
ON "public"."bucket_list_items"
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM "public"."bucket_lists" "bl"
    WHERE "bl"."id" = "bucket_list_id" AND "bl"."user_id" = "auth"."uid"()
  )
);

CREATE POLICY "Enable read access for items in public lists"
ON "public"."bucket_list_items"
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM "public"."bucket_lists" "bl"
    WHERE "bl"."id" = "bucket_list_id" AND "bl"."is_public" = true
  )
);

CREATE POLICY "Enable insert for own lists"
ON "public"."bucket_list_items"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "public"."bucket_lists" "bl"
    WHERE "bl"."id" = "bucket_list_id" AND "bl"."user_id" = "auth"."uid"()
  )
);

CREATE POLICY "Enable delete for own items"
ON "public"."bucket_list_items"
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM "public"."bucket_lists" "bl"
    WHERE "bl"."id" = "bucket_list_id" AND "bl"."user_id" = "auth"."uid"()
  )
);
