-- Categories
INSERT INTO categories (id, name, slug, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Web Development', 'web-development', NOW(), NOW()),
  (gen_random_uuid()::text, 'Mobile Development', 'mobile-development', NOW(), NOW()),
  (gen_random_uuid()::text, 'Data Science', 'data-science', NOW(), NOW()),
  (gen_random_uuid()::text, 'Machine Learning', 'machine-learning', NOW(), NOW()),
  (gen_random_uuid()::text, 'DevOps', 'devops', NOW(), NOW()),
  (gen_random_uuid()::text, 'Cloud Computing', 'cloud-computing', NOW(), NOW()),
  (gen_random_uuid()::text, 'Cybersecurity', 'cybersecurity', NOW(), NOW()),
  (gen_random_uuid()::text, 'Database Design', 'database-design', NOW(), NOW()),
  (gen_random_uuid()::text, 'UI/UX Design', 'ui-ux-design', NOW(), NOW()),
  (gen_random_uuid()::text, 'Graphic Design', 'graphic-design', NOW(), NOW()),
  (gen_random_uuid()::text, 'Business', 'business', NOW(), NOW()),
  (gen_random_uuid()::text, 'Marketing', 'marketing', NOW(), NOW()),
  (gen_random_uuid()::text, 'Mathematics', 'mathematics', NOW(), NOW()),
  (gen_random_uuid()::text, 'Science', 'science', NOW(), NOW()),
  (gen_random_uuid()::text, 'Languages', 'languages', NOW(), NOW()),
  (gen_random_uuid()::text, 'Music', 'music', NOW(), NOW()),
  (gen_random_uuid()::text, 'Photography', 'photography', NOW(), NOW()),
  (gen_random_uuid()::text, 'Health & Fitness', 'health-fitness', NOW(), NOW()),
  (gen_random_uuid()::text, 'Personal Development', 'personal-development', NOW(), NOW()),
  (gen_random_uuid()::text, 'Other', 'other', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Demo Users (password: demo1234)
INSERT INTO users (id, name, email, "passwordHash", role, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Admin User', 'admin@example.com', '$2b$12$tt5UQDo5rVKeauFGLkiCdudYAua70s.rlyj3wwvU7g/ALB7ZifelO', 'ADMIN', NOW(), NOW()),
  (gen_random_uuid()::text, 'John Instructor', 'instructor@example.com', '$2b$12$tt5UQDo5rVKeauFGLkiCdudYAua70s.rlyj3wwvU7g/ALB7ZifelO', 'INSTRUCTOR', NOW(), NOW()),
  (gen_random_uuid()::text, 'Jane Student', 'student@example.com', '$2b$12$tt5UQDo5rVKeauFGLkiCdudYAua70s.rlyj3wwvU7g/ALB7ZifelO', 'STUDENT', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
