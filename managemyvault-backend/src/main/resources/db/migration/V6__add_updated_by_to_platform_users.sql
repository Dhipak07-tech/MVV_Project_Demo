-- V6__add_updated_by_to_platform_users.sql
-- Add missing updated_by column to platform_users for JPA auditing compatibility

ALTER TABLE platform_users ADD COLUMN updated_by UUID;
