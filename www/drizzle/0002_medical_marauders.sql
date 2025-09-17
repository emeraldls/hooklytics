CREATE INDEX "website_user_id_idx" ON "website" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "website_client_id_idx" ON "website" USING btree ("client_id");--> statement-breakpoint
ALTER TABLE "website" ADD CONSTRAINT "website_domain_unique" UNIQUE("domain");