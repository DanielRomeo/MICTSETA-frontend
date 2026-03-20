CREATE TABLE CourseProgress (
   CourseProgressId INT PRIMARY KEY AUTO_INCREMENT,
   StudentId INT,
   CourseId INT,
   completed_lessons_count INT DEFAULT 0,
   percent_complete DECIMAL(5,2) DEFAULT 0.00,
   started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (StudentId) REFERENCES Student(StudentId),
   FOREIGN KEY (CourseId) REFERENCES Course(CourseId)
);

CREATE TABLE Progress (
   ProgressId INT PRIMARY KEY AUTO_INCREMENT,
   StudentId INT,
   LessonId INT, 
   video_position_seconds INT DEFAULT 0,
   completed BOOLEAN DEFAULT FALSE,
   last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (StudentId) REFERENCES Student(StudentId),
   FOREIGN KEY (LessonId) REFERENCES Lesson(LessonId)
);