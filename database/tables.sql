CREATE TABLE Location (
    locationId SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE Universities (
    UniversityID INT PRIMARY KEY,
    Name VARCHAR,
    locationId INT NOT NULL,
    FOREIGN KEY (locationId) REFERENCES Location(locationId)
);



CREATE TABLE USERS(
	StudentID SERIAL PRIMARY KEY,
	FirstName VARCHAR(100),
	LastName VARCHAR(100),
	Email VARCHAR(255),
    UniversityID INT,
    UniversityStudentID VARCHAR(100),
    ContactNumber VARCHAR(20),
    ProfilePicture BYTEA,
    PrimaryMajor VARCHAR(100),
    SecondaryMajor VARCHAR(100),
    Bio Text,
    password VARCHAR(255),
	CONSTRAINT fk_university FOREIGN KEY (UniversityID) REFERENCES universities(UniversityID),
	CONSTRAINT unique_email UNIQUE (Email),
	CONSTRAINT unique_university_student UNIQUE (UniversityID, UniversityStudentID)
	
);

 
CREATE TABLE Categories (
    CategoryID SERIAL PRIMARY KEY,
    CategoryName VARCHAR UNIQUE
);


CREATE TABLE Items (
    ItemID SERIAL PRIMARY KEY,  
    ItemName VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryID INT NOT NULL,
    Condition VARCHAR(50) NOT NULL,
    SellerID INT NOT NULL,
    ItemPicture BYTEA,
    PostDate DATE DEFAULT CURRENT_DATE,
    IsSold BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (SellerID) REFERENCES Users(StudentID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);


CREATE TABLE Transactions (
    transactionId SERIAL PRIMARY KEY,
    itemId INT NOT NULL,
    buyerId INT NOT NULL,
    sellerId INT NOT NULL,
    transactionDate TIMESTAMP NOT NULL DEFAULT NOW(),
    transactionAmount NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (itemId) REFERENCES Items(itemId),
    FOREIGN KEY (buyerId) REFERENCES users(studentId),
    FOREIGN KEY (sellerId) REFERENCES users(studentId)
);

CREATE TABLE Reviews (
  ReviewID SERIAL PRIMARY KEY,
  SellerID INT REFERENCES Users(StudentID) ON DELETE CASCADE,
  ReviewerID INT REFERENCES Users(StudentID) ON DELETE CASCADE,
  Rating INT CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_review UNIQUE (SellerID, ReviewerID)
);


CREATE TABLE Messages (
  MessageID SERIAL PRIMARY KEY,
  ItemID INT REFERENCES Items(ItemID),
  SenderID INT REFERENCES Users(StudentID),
  ReceiverID INT REFERENCES Users(StudentID),
  Content TEXT NOT NULL,
  Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Notifications (
    NotificationID SERIAL PRIMARY KEY,
    ReceiverID INT NOT NULL,
    MessageID INT NOT NULL,
    NotificationText TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReceiverID) REFERENCES Users(StudentID),
    FOREIGN KEY (MessageID) REFERENCES Messages(MessageID)
);
