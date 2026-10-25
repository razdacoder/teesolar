CREATE TYPE "public"."category" AS ENUM('solar-generators', 'inverters', 'batteries', 'panels', 'packages');--> statement-breakpoint
CREATE TYPE "public"."condition" AS ENUM('new', 'fairly used');--> statement-breakpoint
CREATE TYPE "public"."stock_reason" AS ENUM('restock', 'sale', 'adjustment', 'return');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"category" "category" NOT NULL,
	"summary" text NOT NULL,
	"highlights" text[] DEFAULT '{}' NOT NULL,
	"price" integer,
	"old_price" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"condition" "condition" DEFAULT 'new' NOT NULL,
	"output" integer,
	"storage" real,
	"image" text,
	"video" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"reason" "stock_reason" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id");