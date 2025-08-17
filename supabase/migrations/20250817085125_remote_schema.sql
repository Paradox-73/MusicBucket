create extension if not exists "pgjwt" with schema "extensions";

drop extension if exists "pg_net";

drop policy "Users can delete their own items" on "public"."bucket_list_items";

drop policy "Users can insert their own items" on "public"."bucket_list_items";

drop policy "Users can update their own items" on "public"."bucket_list_items";

drop policy "Users can view their own items" on "public"."bucket_list_items";

revoke delete on table "public"."bucket_list_items" from "anon";

revoke insert on table "public"."bucket_list_items" from "anon";

revoke references on table "public"."bucket_list_items" from "anon";

revoke select on table "public"."bucket_list_items" from "anon";

revoke trigger on table "public"."bucket_list_items" from "anon";

revoke truncate on table "public"."bucket_list_items" from "anon";

revoke update on table "public"."bucket_list_items" from "anon";

revoke delete on table "public"."bucket_list_items" from "authenticated";

revoke insert on table "public"."bucket_list_items" from "authenticated";

revoke references on table "public"."bucket_list_items" from "authenticated";

revoke select on table "public"."bucket_list_items" from "authenticated";

revoke trigger on table "public"."bucket_list_items" from "authenticated";

revoke truncate on table "public"."bucket_list_items" from "authenticated";

revoke update on table "public"."bucket_list_items" from "authenticated";

revoke delete on table "public"."bucket_list_items" from "service_role";

revoke insert on table "public"."bucket_list_items" from "service_role";

revoke references on table "public"."bucket_list_items" from "service_role";

revoke select on table "public"."bucket_list_items" from "service_role";

revoke trigger on table "public"."bucket_list_items" from "service_role";

revoke truncate on table "public"."bucket_list_items" from "service_role";

revoke update on table "public"."bucket_list_items" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";


  create table "public"."User" (
    "id" uuid not null,
    "email" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."bucket_list_items" add column "spotify_id" text;

alter table "public"."bucket_list_items" alter column "id" set default extensions.uuid_generate_v4();

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

CREATE UNIQUE INDEX "User_pkey" ON public."User" USING btree (id);

alter table "public"."User" add constraint "User_pkey" PRIMARY KEY using index "User_pkey";


  create policy "Enable delete for users based on user_id"
  on "public"."bucket_list_items"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."bucket_list_items"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Users can delete their own bucket list items"
  on "public"."bucket_list_items"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can update their own bucket list items"
  on "public"."bucket_list_items"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



