-- =============================================
-- BLOG POSTS tábla a FoglaljVelem bloghoz
-- =============================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,                          -- rövid leírás (SEO meta description)
    content TEXT NOT NULL,                 -- teljes cikk tartalom (HTML)
    cover_image TEXT,                      -- borítókép URL (opcionális)
    category TEXT DEFAULT 'tippek',        -- kategória: tippek, esettanulmany, ujdonsag, seo
    tags TEXT[],                           -- címkék tömb
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author TEXT DEFAULT 'FoglaljVelem',
    meta_title TEXT,                       -- SEO title (ha más mint a title)
    meta_description TEXT,                 -- SEO meta description
    published_at TIMESTAMPTZ,             -- mikor lett publikálva
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index a slug-ra (gyors lekérdezés)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- RLS: mindenki olvashatja a publikált posztokat
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published blog posts are public" ON blog_posts;
CREATE POLICY "Published blog posts are public" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Admin (service role) mindent tud
DROP POLICY IF EXISTS "Service role full access to blog" ON blog_posts;
CREATE POLICY "Service role full access to blog" ON blog_posts
    FOR ALL USING (true) WITH CHECK (true);
