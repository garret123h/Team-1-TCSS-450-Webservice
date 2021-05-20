--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (1, 'Test1 and Test2 Chat Room')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 1, Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
    OR Members.Email='test2@test.com'
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (2, 'Test1 and Test3 Chat Room')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 2, Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
    OR Members.Email='test3@test.com'
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (3, 'Test2 and Test3 Chat Room')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 3, Members.MemberId
FROM Members
WHERE Members.Email='test3@test.com'
    OR Members.Email='test2@test.com'
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (4, 'Test1, Test 2, and Test 3 Chat Room')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 4, Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
    OR Members.Email='test2@test.com'
    OR Members.Email='test3@test.com'
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (5, 'Secret Test 1 and Test 2')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 5, Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
    OR Members.Email='test2@test.com'
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (6, 'Secret Test 2 and Test 3')
RETURNING *;

--Add the three test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 6, Members.MemberId
FROM Members
WHERE Members.Email='test3@test.com'
    OR Members.Email='test2@test.com'
RETURNING *;