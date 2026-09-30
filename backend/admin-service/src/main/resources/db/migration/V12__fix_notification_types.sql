-- Flyway Migration V12: Update notification types to comply with notifications_type_check constraint
UPDATE notifications SET type = 'SYSTEM' WHERE type IN ('INFO', 'GENERAL', 'SUCCESS');
UPDATE notifications SET type = 'HEALTH_ALERT' WHERE type = 'WARNING';
