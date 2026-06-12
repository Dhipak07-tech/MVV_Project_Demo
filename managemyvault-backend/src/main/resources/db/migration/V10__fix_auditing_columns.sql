-- V10__fix_auditing_columns.sql
-- Alter documents table updated_by column to UUID and add missing updated_by columns to other tables for JPA auditing consistency

-- 1. Fix documents table
ALTER TABLE documents DROP COLUMN IF EXISTS updated_by;
ALTER TABLE documents ADD COLUMN updated_by UUID;

-- 2. Add updated_by to passwords
ALTER TABLE passwords ADD COLUMN updated_by UUID;

-- 3. Add updated_by to exceptions
ALTER TABLE exceptions ADD COLUMN updated_by UUID;

-- 4. Add updated_by to trackers
ALTER TABLE trackers ADD COLUMN updated_by UUID;

-- 5. Add updated_by to networks_mfa
ALTER TABLE networks_mfa ADD COLUMN updated_by UUID;

-- 6. Add updated_by to assets
ALTER TABLE assets ADD COLUMN updated_by UUID;

-- 7. Add updated_by to networking_assets
ALTER TABLE networking_assets ADD COLUMN updated_by UUID;
