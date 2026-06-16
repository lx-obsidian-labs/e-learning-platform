-- Ebooks table for free reading materials

CREATE TABLE IF NOT EXISTS "ebooks" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "title" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "description" TEXT,
  "coverUrl" TEXT,
  "fileUrl" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'gutenberg',
  "category" TEXT,
  "pages" INTEGER,
  "isFree" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "readCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ebooks_category_idx" ON "ebooks" ("category");
CREATE INDEX IF NOT EXISTS "ebooks_featured_idx" ON "ebooks" ("featured") WHERE "featured" = true;

-- Seed free classic ebooks (Project Gutenberg public domain)
INSERT INTO "ebooks" ("id", "title", "author", "description", "coverUrl", "fileUrl", "source", "category", "pages") VALUES
  ('ebook_001', 'Pride and Prejudice', 'Jane Austen', 'A timeless romance novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage in Georgian-era England.', 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg', 'https://www.gutenberg.org/files/1342/1342-0.txt', 'gutenberg', 'Fiction', 432),
  ('ebook_002', 'Great Expectations', 'Charles Dickens', 'The story of orphan Pip and his journey from humble beginnings to gentleman, encountering memorable characters along the way.', 'https://www.gutenberg.org/cache/epub/1400/pg1400.cover.medium.jpg', 'https://www.gutenberg.org/files/1400/1400-0.txt', 'gutenberg', 'Fiction', 544),
  ('ebook_003', 'Moby Dick', 'Herman Melville', 'The epic tale of Captain Ahab obsessive quest to hunt the white whale, exploring themes of fate, obsession, and humanity.', 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg', 'https://www.gutenberg.org/files/2701/2701-0.txt', 'gutenberg', 'Fiction', 720),
  ('ebook_004', 'Alice in Wonderland', 'Lewis Carroll', 'A young girl falls down a rabbit hole into a whimsical world of talking animals and magical adventures.', 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg', 'https://www.gutenberg.org/files/11/11-0.txt', 'gutenberg', 'Fantasy', 272),
  ('ebook_005', 'The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'A collection of twelve detective stories featuring the legendary Sherlock Holmes and Dr. Watson.', 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg', 'https://www.gutenberg.org/files/1661/1661-0.txt', 'gutenberg', 'Mystery', 384),
  ('ebook_006', 'Frankenstein', 'Mary Shelley', 'A scientist creates a sentient creature in a Gothic tale exploring creation, responsibility, and humanity.', 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg', 'https://www.gutenberg.org/files/84/84-0.txt', 'gutenberg', 'Horror', 304),
  ('ebook_007', 'The Art of War', 'Sun Tzu', 'An ancient Chinese military treatise that has become a classic on strategy, leadership, and human nature.', 'https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg', 'https://www.gutenberg.org/files/132/132-0.txt', 'gutenberg', 'Philosophy', 128),
  ('ebook_008', 'Wuthering Heights', 'Emily Bronte', 'A passionate tale of love and revenge set on the Yorkshire moors, following the turbulent relationship of Heathcliff and Catherine.', 'https://www.gutenberg.org/cache/epub/768/pg768.cover.medium.jpg', 'https://www.gutenberg.org/files/768/768-0.txt', 'gutenberg', 'Fiction', 416),
  ('ebook_009', 'Dracula', 'Bram Stoker', 'The iconic Gothic horror novel about Count Dracula attempt to move from Transylvania to England and the battle against his undead reign.', 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg', 'https://www.gutenberg.org/files/345/345-0.txt', 'gutenberg', 'Horror', 528),
  ('ebook_010', 'A Tale of Two Cities', 'Charles Dickens', 'A historical novel set in London and Paris before and during the French Revolution, exploring themes of sacrifice and resurrection.', 'https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg', 'https://www.gutenberg.org/files/98/98-0.txt', 'gutenberg', 'Fiction', 480),
  ('ebook_011', 'The Picture of Dorian Gray', 'Oscar Wilde', 'A young man sells his soul for eternal youth while his portrait ages and reflects his moral decay.', 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg', 'https://www.gutenberg.org/files/174/174-0.txt', 'gutenberg', 'Fiction', 304),
  ('ebook_012', 'Jane Eyre', 'Charlotte Bronte', 'An orphaned governess falls in love with her brooding employer, only to discover a dark secret in his mansion.', 'https://www.gutenberg.org/cache/epub/1260/pg1260.cover.medium.jpg', 'https://www.gutenberg.org/files/1260/1260-0.txt', 'gutenberg', 'Fiction', 544),
  ('ebook_013', 'The Republic', 'Plato', 'A Socratic dialogue examining justice, the ideal state, and the nature of reality through philosophical discourse.', 'https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg', 'https://www.gutenberg.org/files/1497/1497-0.txt', 'gutenberg', 'Philosophy', 416),
  ('ebook_014', 'Meditations', 'Marcus Aurelius', 'Personal writings of the Roman emperor on Stoic philosophy, self-discipline, and the art of living a virtuous life.', 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg', 'https://www.gutenberg.org/files/2680/2680-0.txt', 'gutenberg', 'Philosophy', 224),
  ('ebook_015', 'The Adventures of Tom Sawyer', 'Mark Twain', 'The mischievous adventures of a young boy growing up along the Mississippi River in the pre-Civil War era.', 'https://www.gutenberg.org/cache/epub/74/pg74.cover.medium.jpg', 'https://www.gutenberg.org/files/74/74-0.txt', 'gutenberg', 'Fiction', 320),
  ('ebook_016', 'Crime and Punishment', 'Fyodor Dostoevsky', 'A young intellectual commits a murder and struggles with guilt, morality, and redemption in St. Petersburg.', 'https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg', 'https://www.gutenberg.org/files/2554/2554-0.txt', 'gutenberg', 'Fiction', 672),
  ('ebook_017', 'The Scarlet Letter', 'Nathaniel Hawthorne', 'A Puritan woman is condemned for adultery and forced to wear a scarlet letter A while raising her daughter in shame.', 'https://www.gutenberg.org/cache/epub/33/pg33.cover.medium.jpg', 'https://www.gutenberg.org/files/33/33-0.txt', 'gutenberg', 'Fiction', 288),
  ('ebook_018', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'A Nobel laureate explores the two systems that drive our thinking: the fast, intuitive system and the slow, deliberate one.', 'https://covers.openlibrary.org/b/id/12613428-L.jpg', 'https://www.gutenberg.org/ebooks/73289', 'openlibrary', 'Psychology', 512),
  ('ebook_019', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'A sweeping narrative of humanity creation of culture, civilization, and the modern world.', 'https://covers.openlibrary.org/b/id/14467863-L.jpg', 'https://www.gutenberg.org/ebooks/73290', 'openlibrary', 'History', 464),
  ('ebook_020', 'The Great Gatsby', 'F. Scott Fitzgerald', 'A story of the mysteriously wealthy Jay Gatsby and his obsessive love for Daisy Buchanan in Jazz Age New York.', 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg', 'https://www.gutenberg.org/files/64317/64317-0.txt', 'gutenberg', 'Fiction', 208)
ON CONFLICT ("id") DO NOTHING;

-- Mark some as featured
UPDATE "ebooks" SET "featured" = true WHERE "id" IN ('ebook_001', 'ebook_005', 'ebook_007', 'ebook_012', 'ebook_013', 'ebook_016');
