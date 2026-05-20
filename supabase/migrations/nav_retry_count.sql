-- NAV retry számláló mező az invoices táblához
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nav_retry_count INTEGER DEFAULT 0;
