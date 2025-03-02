-- Enable Row Level Security
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Policy for inserting artworks (authenticated users can insert)
CREATE POLICY "Users can insert artworks"
ON artworks FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for selecting artworks (anyone can view)
CREATE POLICY "Anyone can view artworks"
ON artworks FOR SELECT
USING (true);

-- Policy for updating artworks (authenticated users can update their uploads)
CREATE POLICY "Users can update their artworks"
ON artworks FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for deleting artworks (authenticated users can delete their uploads)
CREATE POLICY "Users can delete their artworks"
ON artworks FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL); 