-- Enable storage by creating policies
CREATE POLICY "Give users access to own folder" ON storage.objects
    FOR ALL USING (
        bucket_id = 'artworks' AND 
        (auth.role() = 'authenticated' OR auth.role() = 'anon')
    );

-- Allow public access to view images
CREATE POLICY "Allow public viewing of images" ON storage.objects
    FOR SELECT USING (bucket_id = 'artworks');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'artworks' AND 
        auth.role() = 'authenticated'
    ); 