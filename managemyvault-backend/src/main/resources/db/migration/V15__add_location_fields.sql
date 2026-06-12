-- V15__add_location_fields.sql
-- Add city and country columns to the locations table to match the Location JPA entity

ALTER TABLE locations ADD COLUMN city VARCHAR(255);
ALTER TABLE locations ADD COLUMN country VARCHAR(255);
