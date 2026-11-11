-- ==============================================================================
-- YCCify Seed Data - Yeshwantrao Chavan College of Engineering (YCCE), Nagpur
-- ==============================================================================

-- 1. Insert College
INSERT INTO colleges (id, name, code, city, state, logo_url)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'Yeshwantrao Chavan College of Engineering',
    'YCCE',
    'Nagpur',
    'Maharashtra',
    '/assets/logo.jpg'
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Branches
INSERT INTO branches (id, college_id, name, code, icon, semesters_count, courses_count)
VALUES 
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Information Technology', 'IT', 'Cpu', 8, 42),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Computer Science & Engg.', 'CSE', 'Code', 8, 48),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Electronics & Telecomm.', 'ETC', 'Radio', 8, 40),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Mechanical Engineering', 'ME', 'Settings', 8, 38),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Civil Engineering', 'CE', 'Building', 8, 36)
ON CONFLICT (college_id, code) DO NOTHING;

-- 3. Insert Semesters for IT Branch
INSERT INTO semesters (id, branch_id, semester_number, academic_year)
VALUES
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, '2025-2026'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, '2025-2026'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 3, '2025-2026'),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 4, '2025-2026'),
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 5, '2025-2026'),
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 6, '2025-2026'),
    ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 7, '2025-2026'),
    ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', 8, '2025-2026')
ON CONFLICT (branch_id, semester_number) DO NOTHING;

-- 4. Insert Faculty
INSERT INTO faculty (id, college_id, branch_id, name, designation, department, specialization, email, phone, avatar_url)
VALUES
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Dr. S. S. Khedkar', 'Professor', 'Information Technology', 'Machine Learning, Artificial Intelligence, Neural Networks', 'ss.khedkar@ycce.edu', '+91 98220 12345', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Prof. R. A. Deshmukh', 'Associate Professor', 'Information Technology', 'Cloud Computing, Distributed Systems, DevOps', 'ra.deshmukh@ycce.edu', '+91 98220 23456', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Prof. P. D. Patil', 'Assistant Professor', 'Information Technology', 'DevOps, CI/CD, Containerization, Web Technologies', 'pd.patil@ycce.edu', '+91 98220 34567', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Prof. N. V. Raut', 'Assistant Professor', 'Information Technology', 'Information Security, Cryptography, Cyber Defense', 'nv.raut@ycce.edu', '+91 98220 45678', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
    ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Prof. A. K. Thakre', 'Assistant Professor', 'Information Technology', 'Project Management, Agile Methodologies, Software Engg.', 'ak.thakre@ycce.edu', '+91 98220 56789', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150')
ON CONFLICT (email) DO NOTHING;

-- 5. Insert Courses for Semester 7 IT
INSERT INTO courses (id, semester_id, branch_id, name, code, credits, description, icon)
VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Machine Learning', 'IT701', 4, 'Supervised, Unsupervised learning, Neural Networks, Model evaluation and practical deep learning applications.', 'Brain'),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Cloud Computing', 'IT702', 3, 'Virtualization, Cloud architectures (IaaS, PaaS, SaaS), AWS/GCP deployments, microservices, and serverless computing.', 'Cloud'),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'DevOps', 'IT703', 3, 'CI/CD pipelines, Docker containers, Kubernetes orchestration, GitOps, and infrastructure monitoring.', 'Infinity'),
    ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Information Security', 'IT704', 3, 'Symmetric/Asymmetric encryption, network attack vectors, firewalls, and ISO 27001 compliance standards.', 'ShieldCheck'),
    ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Project Management', 'IT705', 2, 'Agile sprint planning, Gantt charts, risk mitigation, and cost-benefit estimations.', 'Briefcase')
ON CONFLICT (semester_id, code) DO NOTHING;

-- 6. Assign Faculty to Courses
INSERT INTO course_faculty (id, course_id, faculty_id)
VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
    ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003'),
    ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004'),
    ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005')
ON CONFLICT (course_id, faculty_id) DO NOTHING;

-- 7. Insert Profiles (Admin & Demo Student)
INSERT INTO profiles (id, email, name, roll_number, college_id, branch_id, semester_id, role, avatar_url)
VALUES
    ('70000000-0000-0000-0000-000000000001', 'admin@ycce.edu', 'Prof. Administrative Dean', 'ADMIN01', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NULL, 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('70000000-0000-0000-0000-000000000002', 'rahul.sharma@ycce.edu', 'Rahul Sharma', 'IT2022045', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Academic Resources
INSERT INTO resources (id, course_id, category, title, description, unit_topic, uploader_id, approval_status, downloads_count, views_count)
VALUES
    ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'notes', 'Unit 1 - Introduction to ML.pdf', 'Foundations of learning paradigms, hypothesis spaces, and inductive bias.', 'Unit 1: Foundations', '70000000-0000-0000-0000-000000000002', 'approved', 142, 530),
    ('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'notes', 'Unit 2 - Data Preprocessing.pdf', 'Handling missing data, normalization, categorical encoding, and PCA dimensionality reduction.', 'Unit 2: Feature Engineering', '70000000-0000-0000-0000-000000000002', 'approved', 98, 380),
    ('80000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'notes', 'Unit 3 - Classification.pdf', 'Decision Trees, Naive Bayes, Support Vector Machines (SVM), and k-Nearest Neighbors (k-NN).', 'Unit 3: Classification Algorithms', '70000000-0000-0000-0000-000000000002', 'approved', 265, 890),
    ('80000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'notes', 'Unit 4 - Clustering.pdf', 'K-Means, Hierarchical clustering, DBSCAN, and silhouette score optimization.', 'Unit 4: Unsupervised Clustering', '70000000-0000-0000-0000-000000000002', 'approved', 84, 310),
    ('80000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 'notes', 'Unit 5 - Neural Networks.pdf', 'Perceptrons, Multilayer Feedforward Networks, Backpropagation, and Activation Functions.', 'Unit 5: Deep Learning Intro', '70000000-0000-0000-0000-000000000002', 'approved', 178, 640),
    ('80000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001', 'pyqs', 'ML - End Semester Exam 2024.pdf', 'Previous Year Question Paper Winter 2024 with complete solution hints.', 'PYQ Winter 2024', '70000000-0000-0000-0000-000000000002', 'approved', 312, 1140),
    ('80000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000001', 'practicals', 'ML Lab Manual & Python Code.pdf', 'Scikit-Learn implementation of 10 essential laboratory experiments.', 'Lab Experiments 1-10', '70000000-0000-0000-0000-000000000002', 'approved', 205, 780),
    ('80000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000001', 'assignments', 'Assignment 1 - Regression Models.pdf', 'Practical assignment questions with mathematical derivations for Linear Regression.', 'Assignment 1', '70000000-0000-0000-0000-000000000002', 'approved', 110, 420),
    -- Pending submissions for Admin Approval
    ('80000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000001', 'notes', 'ML - Unit 6 Notes.pdf', 'Deep Learning & Transfer Learning notes contributed by student.', 'Unit 6: Advanced ML', '70000000-0000-0000-0000-000000000002', 'pending', 0, 1),
    ('80000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000002', 'practicals', 'CN - Lab Manual.pdf', 'Computer Networks socket programming and Wireshark traces.', 'Lab Practical manual', '70000000-0000-0000-0000-000000000002', 'pending', 0, 1),
    ('80000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000004', 'assignments', 'IS - Assignment 1.pdf', 'RSA and Diffie-Hellman Key Exchange numerical problems.', 'Assignment Security', '70000000-0000-0000-0000-000000000002', 'pending', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Resource Files
INSERT INTO resource_files (id, resource_id, file_name, file_url, storage_path, file_size_bytes, mime_type, page_count)
VALUES
    ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Unit 1 - Introduction to ML.pdf', '/api/storage/files/rf1', 'resources/ml_unit1.pdf', 2202009, 'application/pdf', 24),
    ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', 'Unit 2 - Data Preprocessing.pdf', '/api/storage/files/rf2', 'resources/ml_unit2.pdf', 3565158, 'application/pdf', 32),
    ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000003', 'Unit 3 - Classification.pdf', '/api/storage/files/rf3', 'resources/ml_unit3.pdf', 3355443, 'application/pdf', 28),
    ('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000004', 'Unit 4 - Clustering.pdf', '/api/storage/files/rf4', 'resources/ml_unit4.pdf', 3040870, 'application/pdf', 22),
    ('90000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000005', 'Unit 5 - Neural Networks.pdf', '/api/storage/files/rf5', 'resources/ml_unit5.pdf', 4299161, 'application/pdf', 36),
    ('90000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000006', 'ML - End Semester Exam 2024.pdf', '/api/storage/files/rf6', 'resources/ml_pyq2024.pdf', 1887436, 'application/pdf', 6),
    ('90000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000007', 'ML Lab Manual & Python Code.pdf', '/api/storage/files/rf7', 'resources/ml_lab_manual.pdf', 5242880, 'application/pdf', 44),
    ('90000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000008', 'Assignment 1 - Regression Models.pdf', '/api/storage/files/rf8', 'resources/ml_assign1.pdf', 943718, 'application/pdf', 4),
    ('90000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000009', 'ML - Unit 6 Notes.pdf', '/api/storage/files/rf9', 'resources/ml_unit6.pdf', 3145728, 'application/pdf', 20),
    ('90000000-0000-0000-0000-000000000010', '80000000-0000-0000-0000-000000000010', 'CN - Lab Manual.pdf', '/api/storage/files/rf10', 'resources/cn_lab.pdf', 2831155, 'application/pdf', 18),
    ('90000000-0000-0000-0000-000000000011', '80000000-0000-0000-0000-000000000011', 'IS - Assignment 1.pdf', '/api/storage/files/rf11', 'resources/is_assign1.pdf', 1258291, 'application/pdf', 5)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Bookmarks for Rahul
INSERT INTO bookmarks (id, user_id, resource_id)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001'),
    ('a0000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003'),
    ('a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000006')
ON CONFLICT (user_id, resource_id) DO NOTHING;

-- 11. Insert Upload Approvals Audit
INSERT INTO upload_approvals (id, resource_id, status, remarks)
VALUES
    ('b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000009', 'pending', 'Submitted by Rahul Sharma. Pending review for Unit 6 curriculum match.'),
    ('b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000010', 'pending', 'CN Wireshark Lab Manual pending lab assistant review.'),
    ('b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000011', 'pending', 'IS Assignment 1 numerical problems pending faculty sign-off.')
ON CONFLICT (id) DO NOTHING;

-- 12. Insert Sample Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read)
VALUES
    ('c0000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'Resource Approved', 'Your upload "Unit 3 - Classification.pdf" has been approved and published to IT Semester 7.', 'success', false),
    ('c0000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'New Lecture Notes Added', 'Prof. S. S. Khedkar uploaded new lecture notes for Unit 5 - Neural Networks.', 'info', true)
ON CONFLICT (id) DO NOTHING;
