-- Insert test student
INSERT INTO students (name, folder_name, grade) 
VALUES ('Adrian Årnes', 'adrian-årnes', '1')
ON CONFLICT (id) DO NOTHING; 