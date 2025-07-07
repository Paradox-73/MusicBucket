ALTER TABLE bucket_list_items
ADD COLUMN name text NOT NULL DEFAULT '',
ADD COLUMN "imageUrl" text,
ADD COLUMN artists text[];