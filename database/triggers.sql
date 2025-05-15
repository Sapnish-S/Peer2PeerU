-- Procedure to insert a new notification
CREATE OR REPLACE PROCEDURE create_notification(
    receiver INT,
    msg_id INT,
    notif_text TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Notifications (ReceiverID, MessageID, NotificationText)
    VALUES (receiver, msg_id, notif_text);
END;
$$;

-- Trigger function to call the notification procedure after a new message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    CALL create_notification(
        NEW.ReceiverID,
        NEW.MessageID,
        'You have a new message!'
    );
    RETURN NEW;
END;
$$;

-- Trigger to notify user after a new message is inserted
CREATE TRIGGER trigger_notify_on_message
AFTER INSERT ON Messages
FOR EACH ROW
EXECUTE FUNCTION notify_on_new_message();

-- Function to capitalize first and last names before insert/update
CREATE OR REPLACE FUNCTION trg_capitalize_user_names()
RETURNS TRIGGER AS $$
BEGIN
  NEW.firstname := INITCAP(NEW.firstname);
  NEW.lastname  := INITCAP(NEW.lastname);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger to avoid conflict
DROP TRIGGER IF EXISTS users_capitalize_names ON users;

-- Trigger to format names on insert or update
CREATE TRIGGER users_capitalize_names
  BEFORE INSERT OR UPDATE
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION trg_capitalize_user_names();
