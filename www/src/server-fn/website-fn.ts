import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { website } from "~/schemas/website-schema";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { canExecServerFn } from "~/middlewares/auth-server-fn";
import { v4 as uuidv4 } from "uuid";

const querySchema = z.object({
  page: z.number(),
  limit: z.number(),
});

export const getServerWebsites = createServerFn({ method: "GET" })
  .validator(querySchema)
  .middleware([canExecServerFn])
  .handler(async ({ data: { page, limit }, context }) => {
    const offset = (page - 1) * limit;

    try {
      const data = await db
        .select()
        .from(website)
        .where(eq(website.user_id, context.user.id))
        .orderBy(desc(website.created_at))
        .limit(limit)
        .offset(offset);

      const total = await db.$count(
        website,
        eq(website.user_id, context.user.id)
      );

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error(err);
      throw Error("something went wrong");
    }
  });

const payload = z.object({
  domain: z.url().transform((val) => new URL(val).hostname.toLowerCase()),

  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[\w\s-]+$/)
    .transform((val) => val.trim()),
});

export const addWebsite = createServerFn({ method: "POST" })
  .middleware([canExecServerFn])
  .validator(payload)
  .handler(async ({ data: { domain, name }, context: { user } }) => {
    try {
      const [newWebsite] = await db
        .insert(website)
        .values({ domain: domain, name: name, id: uuidv4(), user_id: user.id })
        .returning();

      return {
        message: "new website added successfully",
        data: newWebsite,
      };
    } catch (err) {
      throw Error(err instanceof Error ? err.message : "something went wrong");
    }
  });

const websiteIdSchema = z.object({
  id: z.uuidv4("Invalid website ID format"),
});

export const getWebsiteById = createServerFn({ method: "GET" })
  .validator(websiteIdSchema)
  .middleware([canExecServerFn])
  .handler(async ({ data: { id }, context: { user } }) => {
    try {
      const [websiteData] = await db
        .select()
        .from(website)
        .where(and(eq(website.id, id), eq(website.user_id, user.id)));

      if (!websiteData) {
        throw new Error(
          "Website not found or you don't have permission to access it"
        );
      }

      return { data: websiteData };
    } catch (err) {
      throw Error(err instanceof Error ? err.message : "something went wrong");
    }
  });

const updatePayload = z.object({
  id: z.uuidv4("Invalid website ID format"),
  domain: z
    .url()
    .transform((val) => new URL(val).hostname.toLowerCase())
    .optional(),
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[\w\s-]+$/)
    .transform((val) => val.trim())
    .optional(),
});

export const updateWebsite = createServerFn({ method: "POST" })
  .middleware([canExecServerFn])
  .validator(updatePayload)
  .handler(async ({ data: { id, domain, name }, context: { user } }) => {
    try {
      const [existingWebsite] = await db
        .select()
        .from(website)
        .where(and(eq(website.id, id), eq(website.user_id, user.id)));

      if (!existingWebsite) {
        throw new Error("Website not found");
      }

      const updateData: any = {
        updated_at: new Date().toISOString().split("T")[0],
      };
      if (domain !== undefined) updateData.domain = domain;
      if (name !== undefined) updateData.name = name;

      const [updatedWebsite] = await db
        .update(website)
        .set(updateData)
        .where(and(eq(website.id, id), eq(website.user_id, user.id)))
        .returning();

      return {
        message: "Website updated successfully",
        data: updatedWebsite,
      };
    } catch (err) {
      throw Error(err instanceof Error ? err.message : "something went wrong");
    }
  });

export const deleteWebsite = createServerFn({ method: "POST" })
  .validator(websiteIdSchema)
  .middleware([canExecServerFn])
  .handler(async ({ data: { id }, context: { user } }) => {
    try {
      const [existingWebsite] = await db
        .select()
        .from(website)
        .where(and(eq(website.id, id), eq(website.user_id, user.id)));

      if (!existingWebsite) {
        throw new Error("Website not found");
      }

      await db
        .delete(website)
        .where(and(eq(website.id, id), eq(website.user_id, user.id)));

      return {
        message: "Website deleted successfully",
        data: { id },
      };
    } catch (err) {
      throw Error(err instanceof Error ? err.message : "something went wrong");
    }
  });

export const hasAnyWebsite = createServerFn({ method: "GET" })
  .middleware([canExecServerFn])
  .handler(async ({ context: { user } }) => {
    try {
      const [row] = await db
        .select({ id: website.id })
        .from(website)
        .where(eq(website.user_id, user.id))
        .limit(1);

      return { hasAny: !!row };
    } catch (err) {
      throw Error(err instanceof Error ? err.message : "something went wrong");
    }
  });
