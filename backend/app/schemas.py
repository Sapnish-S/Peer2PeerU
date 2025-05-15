from pydantic import BaseModel
from typing import List
from datetime import datetime

class RegisterRequest(BaseModel):
    firstname: str
    lastname: str
    email: str
    universityid: int
    universitystudentid: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    contact: str
    primaryMajor: str
    secondaryMajor: str
    bio: str

class MessageCreate(BaseModel):
    item_id: int
    sender_id: int
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    message_id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: str

class ConversationResponse(BaseModel):
    itemId: int
    itemTitle: str
    otherUserId: int
    otherUserName: str

class Notification(BaseModel):
    notification_id: int
    receiver_id: int
    message_id: int
    notification_text: str
    is_read: bool
    created_at: datetime
