
from pydantic import BaseModel

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
