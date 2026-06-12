-- V14__add_missing_auditing_columns.sql
-- Add missing updated_by columns to contacts and locations tables for JPA auditing consistency

-- 1. Add updated_by to contacts
ALTER TABLE contacts ADD COLUMN updated_by UUID;

-- 2. Add updated_by to locations
ALTER TABLE locations ADD COLUMN updated_by UUID;
