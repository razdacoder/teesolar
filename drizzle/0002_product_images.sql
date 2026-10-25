ALTER TABLE "products" ADD COLUMN "images" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
UPDATE "products" SET "images" = ARRAY["image"] WHERE "image" IS NOT NULL;
