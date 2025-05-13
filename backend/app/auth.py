from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import Response, StreamingResponse
from passlib.context import CryptContext
from app.schemas import RegisterRequest, LoginRequest, ProfileUpdate, MessageCreate, MessageResponse, ConversationResponse
from app.database import conn, cursor
import psycopg2
import base64
import datetime
import time
from io import BytesIO

auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Register
@auth_router.post("/register")
def register_user(request: RegisterRequest):
    try:
        cursor.execute("SELECT 1 FROM Users WHERE Email = %s", (request.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        cursor.execute("""
            SELECT 1 FROM Users WHERE UniversityID = %s AND UniversityStudentID = %s
        """, (request.universityid, request.universitystudentid))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="University student ID already in use")

        hashed_password = pwd_context.hash(request.password)
        cursor.execute("""
            INSERT INTO Users (FirstName, LastName, Email, UniversityID, UniversityStudentID, Password)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            request.firstname,
            request.lastname,
            request.email,
            request.universityid,
            request.universitystudentid,
            hashed_password
        ))
        conn.commit()
        return {"message": "User registered successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Login
@auth_router.post("/")
def login_user(request: LoginRequest):
    try:
        cursor.execute("SELECT StudentID, Email, Password FROM Users WHERE Email = %s", (request.email,))
        user = cursor.fetchone()
        if not user or not pwd_context.verify(request.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid Email or Password")
        return {"message": "Login successful", "student_id": user[0]}
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Get Profile
@auth_router.get("/profile/{studentId}")
def get_profile(studentId: int):
    time.sleep(0.5)
    cursor.execute("""
        SELECT StudentID, FirstName, LastName, Email, UniversityId, UniversityStudentId,
               ContactNumber, PrimaryMajor, SecondaryMajor, Bio, ProfilePicture
        FROM Users WHERE StudentID = %s
    """, (studentId,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    image_base64 = base64.b64encode(user[10]).decode('utf-8') if user[10] else None
    return {
        "firstName": user[1], "lastName": user[2], "email": user[3],
        "universityId": user[4], "universityStudentId": user[5],
        "contact": user[6], "primaryMajor": user[7], "secondaryMajor": user[8], "bio": user[9],
        "profileImage": f"data:image/jpeg;base64,{image_base64}" if image_base64 else None,
    }

# Update Profile
@auth_router.put("/profile/{studentId}")
def update_profile(studentId: int, request: ProfileUpdate):
    try:
        cursor.execute("""
            UPDATE Users SET ContactNumber = %s, PrimaryMajor = %s, SecondaryMajor = %s, Bio = %s
            WHERE StudentID = %s
        """, (request.contact, request.primaryMajor, request.secondaryMajor, request.bio, studentId))
        conn.commit()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

# Upload Profile Image
@auth_router.post("/upload-profile-image/{student_id}")
async def upload_profile_image(student_id: int, file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are allowed")
    try:
        content = await file.read()
        cursor.execute("UPDATE users SET profilepicture = %s WHERE studentid = %s", (psycopg2.Binary(content), student_id))
        conn.commit()
        return {"message": "Profile image uploaded successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload profile image")

# Get Profile Image
@auth_router.get("/profile-image/{student_id}")
def get_profile_image(student_id: int):
    cursor.execute("SELECT profilepicture FROM users WHERE studentid = %s", (student_id,))
    row = cursor.fetchone()
    if row and row[0]:
        return StreamingResponse(BytesIO(row[0]), media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Profile image not found")

# Get Items
@auth_router.get("/items")
def get_items():
    try:
        cursor.execute("""
            SELECT ItemID, ItemName, Description, Price, CategoryID, Condition, SellerID, PostDate, IsSold
            FROM Items ORDER BY PostDate DESC
        """)
        rows = cursor.fetchall()
        return [
            {
                "itemId": row[0], "title": row[1], "description": row[2], "price": row[3],
                "categoryId": row[4], "condition": row[5], "sellerId": row[6],
                "postDate": row[7], "isSold": row[8]
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch items")

# Get Item Image
@auth_router.get("/item-image/{item_id}")
def get_item_image(item_id: int):
    cursor.execute("SELECT itempicture FROM items WHERE itemid = %s", (item_id,))
    row = cursor.fetchone()
    if row and row[0]:
        return Response(content=row[0], media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Item image not found")

# Get Item Details
@auth_router.get("/item/{item_id}")
def get_item(item_id: int):
    cursor.execute("""
        SELECT i.ItemID, i.ItemName, i.Description, i.Price, i.Condition,
               u.Email, u.StudentID, u.FirstName, u.LastName
        FROM Items i
        JOIN Users u ON i.SellerID = u.StudentID
        WHERE i.ItemID = %s
    """, (item_id,))
    row = cursor.fetchone()
    if not row or len(row) < 9:
        raise HTTPException(status_code=404, detail="Item not found or incomplete data")
    return {
        "itemId": row[0], "title": row[1], "description": row[2], "price": float(row[3]) if row[3] else None,
        "condition": row[4], "sellerEmail": row[5], "sellerId": row[6], "sellerName": f"{row[7]} {row[8]}"
    }

# Create Item
@auth_router.post("/items/{student_id}")
async def create_item_with_image(
    student_id: int,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    categoryId: int = Form(...),
    condition: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        content = await image.read()
        cursor.execute("""
            INSERT INTO Items (ItemName, Description, Price, CategoryID, Condition, SellerID, ItemPicture, PostDate, IsSold)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, FALSE)
        """, (
            title, description, price, categoryId, condition, student_id, psycopg2.Binary(content)
        ))
        conn.commit()
        return {"message": "Item listed successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Failed to list item")

# Get Categories
@auth_router.get("/categories")
def get_categories():
    try:
        cursor.execute("SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryID ASC")
        rows = cursor.fetchall()
        return [{"CategoryID": row[0], "CategoryName": row[1]} for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch categories")

# Search
@auth_router.get("/search")
def search_items(query: str):
    cursor.execute("""
        SELECT i.ItemID, i.ItemName, i.Description, i.Price, i.Condition, u.Email
        FROM Items i JOIN Users u ON i.SellerID = u.StudentID
        WHERE LOWER(i.ItemName) LIKE %s OR LOWER(i.Description) LIKE %s
    """, (f"%{query.lower()}%", f"%{query.lower()}%"))
    rows = cursor.fetchall()
    return [
        {
            "itemId": row[0], "title": row[1], "description": row[2],
            "price": row[3], "condition": row[4], "sellerEmail": row[5]
        }
        for row in rows
    ]

# Send Message
@auth_router.post("/messages")
def send_message(msg: MessageCreate):
    try:
        cursor.execute("""
            INSERT INTO Messages (ItemID, SenderID, ReceiverID, Content)
            VALUES (%s, %s, %s, %s)
        """, (msg.item_id, msg.sender_id, msg.receiver_id, msg.content))
        conn.commit()
        return {"message": "Message sent successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Get Item Conversation
@auth_router.get("/messages/item/{item_id}", response_model=list[MessageResponse])
def get_item_conversation(item_id: int, user1: int = Query(...), user2: int = Query(...)):
    cursor.execute("""
        SELECT MessageID, SenderID, ReceiverID, Content, Timestamp
        FROM Messages
        WHERE ItemID = %s AND (
            (SenderID = %s AND ReceiverID = %s) OR (SenderID = %s AND ReceiverID = %s)
        )
        ORDER BY Timestamp ASC
    """, (item_id, user1, user2, user2, user1))
    rows = cursor.fetchall()
    return [
        {"message_id": row[0], "sender_id": row[1], "receiver_id": row[2], "content": row[3], "timestamp": row[4].isoformat()}
        for row in rows
    ]

# Get Conversations
@auth_router.get("/conversations/{student_id}", response_model=list[ConversationResponse])
def get_conversations(student_id: int):
    try:
        cursor.execute("""
            SELECT DISTINCT ON (
                m.ItemID,
                CASE WHEN m.SenderID = %s THEN m.ReceiverID ELSE m.SenderID END
            )
                m.ItemID,
                i.ItemName,
                CASE WHEN m.SenderID = %s THEN m.ReceiverID ELSE m.SenderID END AS OtherUserID,
                COALESCE(u.FirstName, 'Unknown'),
                COALESCE(u.LastName, '')
            FROM Messages m
            JOIN Items i ON m.ItemID = i.ItemID
            LEFT JOIN Users u ON u.StudentID = CASE
                WHEN m.SenderID = %s THEN m.ReceiverID
                ELSE m.SenderID
            END
            WHERE m.SenderID = %s OR m.ReceiverID = %s
            GROUP BY m.ItemID, i.ItemName, OtherUserID, u.FirstName, u.LastName
            ORDER BY m.ItemID, OtherUserID, MAX(m.Timestamp) DESC
        """, (student_id, student_id, student_id, student_id, student_id))
        rows = cursor.fetchall()
        return [
            {"itemId": row[0], "itemTitle": row[1], "otherUserId": row[2], "otherUserName": f"{row[3]} {row[4]}"}
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")

# Get User Name
@auth_router.get("/user/{student_id}")
def get_user_name(student_id: int):
    cursor.execute("SELECT FirstName, LastName FROM Users WHERE StudentID = %s", (student_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"firstName": user[0], "lastName": user[1]}
# Submit or update a seller review
@auth_router.post("/seller-review")
def post_seller_review(
    seller_id: int = Form(...),
    reviewer_id: int = Form(...),
    rating: int = Form(...),
    comment: str = Form(...)
):
    if seller_id == reviewer_id:
        raise HTTPException(status_code=400, detail="You cannot review yourself.")
    
    try:
        cursor.execute("""
            INSERT INTO Reviews (SellerID, ReviewerID, Rating, Comment)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (SellerID, ReviewerID)
            DO UPDATE SET Rating = EXCLUDED.Rating, Comment = EXCLUDED.Comment, Timestamp = CURRENT_TIMESTAMP
        """, (seller_id, reviewer_id, rating, comment))
        conn.commit()
        return {"message": "Review submitted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Fetch all reviews for a seller
@auth_router.get("/seller-reviews/{seller_id}")
def get_seller_reviews(seller_id: int):
    cursor.execute("""
        SELECT r.Rating, r.Comment, r.Timestamp, u.FirstName, u.LastName
        FROM Reviews r
        JOIN Users u ON r.ReviewerID = u.StudentID
        WHERE r.SellerID = %s
        ORDER BY r.Timestamp DESC
    """, (seller_id,))
    rows = cursor.fetchall()
    return [
        {
            "rating": row[0],
            "comment": row[1],
            "timestamp": row[2],
            "reviewerName": f"{row[3]} {row[4]}"
        }
        for row in rows
    ]
