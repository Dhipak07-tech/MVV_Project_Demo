-- V5__add_updated_by_to_organization_members.sql
-- Add missing updated_by column to organization_members for JPA auditing compatibility

ALTER TABLE organization_members ADD COLUMN updated_by UUID;
